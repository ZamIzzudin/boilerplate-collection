import { AppError } from "@/common/errors";
import { env } from "@/config/env";
import { comparePassword, hashPassword, isStrongPassword } from "@/lib/password";
import { generateToken } from "@/lib/id";
import { sendMail } from "@/lib/mailer";
import { encrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken, verifyToken } from "@/lib/jwt";
import { buildMenuTree } from "@/modules/menu/menu.tree";
import type {
  LoginInput,
  ResetPasswordInput,
  ValidTokenInput,
  ChangePasswordInput,
} from "./auth.schema";

const TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour

/** Load everything needed to build the menu tree for a given user type. */
const loadMenuContext = async (userTypeId: number) => {
  const [menus, menuActions, actions, privileges] = await Promise.all([
    prisma.menu.findMany(),
    prisma.menuAction.findMany(),
    prisma.action.findMany(),
    prisma.privilege.findMany({ where: { userTypeId } }),
  ]);

  return buildMenuTree({ menus, menuActions, actions, privileges });
};

export const authService = {
  /** Health check endpoint used by the frontend register flow (email availability). */
  async checkEmail(email: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    return {
      status: existing ? 1 : 0,
      message: existing ? "Email sudah terdaftar" : "Email tersedia",
    };
  },

  async login({ email, user_type_id, password }: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { userType: true },
    });

    if (!user) throw AppError.unauthorized("Email atau password salah");

    const passwordValid = await comparePassword(password, user.password);
    if (!passwordValid) throw AppError.unauthorized("Email atau password salah");

    if (user.statusCode === "PENDING") {
      return {
        pending: true as const,
        status: 110,
        message: "Akun Anda masih menunggu proses verifikasi",
      };
    }

    if (user.statusCode !== "ACTIVE") {
      throw AppError.forbidden("Akun Anda tidak aktif");
    }

    if (String(user.userTypeId) !== String(user_type_id)) {
      throw AppError.unauthorized("Jenis user tidak sesuai");
    }

    const menus = await loadMenuContext(user.userTypeId);
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      userTypeId: user.userTypeId,
    };

    return {
      pending: false as const,
      accessToken: signAccessToken(tokenPayload),
      refreshToken: signRefreshToken(tokenPayload),
      data: {
        id: user.id,
        user_email: user.email,
        user_status: user.statusCode,
        user_type_user_type_id: String(user.userTypeId),
        user_type_name: user.userType.name,
        access_token: signAccessToken(tokenPayload),
        refresh_token: signRefreshToken(tokenPayload),
        actions: [],
        menus,
      },
    };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userType: true },
    });
    if (!user) throw AppError.unauthorized();

    const menus = await loadMenuContext(user.userTypeId);

    return {
      id: user.id,
      username: user.username,
      user_email: user.email,
      user_status: user.statusCode,
      user_type_user_type_id: String(user.userTypeId),
      user_type_name: user.userType.name,
      menus,
    };
  },

  async profile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userType: true },
    });
    if (!user) throw AppError.notFound("User tidak ditemukan");

    return {
      id: user.id,
      username: user.username,
      user_email: user.email,
      user_type_user_type_id: String(user.userTypeId),
      user_type_name: user.userType.name,
    };
  },

  refresh(refreshToken?: string) {
    if (!refreshToken) throw AppError.unauthorized("Session not found");

    const payload = verifyToken(refreshToken);
    if (!payload || payload.type !== "refresh") {
      throw AppError.unauthorized("Session expired");
    }

    const tokenPayload = {
      sub: payload.sub,
      email: payload.email,
      userTypeId: payload.userTypeId,
    };

    return {
      accessToken: signAccessToken(tokenPayload),
      refreshToken: signRefreshToken(tokenPayload),
    };
  },

  async forgotPassword(email: string, userType?: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond success to avoid email enumeration.
    if (!user || (userType && String(user.userTypeId) !== String(userType))) {
      return { status: 0, message: "Jika email terdaftar, tautan reset telah dikirim" };
    }

    const token = generateToken();
    await prisma.authToken.create({
      data: {
        email: user.email,
        token,
        action: "reset",
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    });

    const encryptedToken = encrypt({ email: user.email, token });
    const link = `${env.appUrl}/reset/${encryptedToken}`;

    await sendMail({
      to: user.email,
      subject: "Atur Ulang Kata Sandi",
      html: `<p>Klik tautan berikut untuk mengatur ulang kata sandi Anda:</p><p><a href="${link}">${link}</a></p>`,
    });

    return { status: 0, message: "Tautan reset telah dikirim" };
  },

  /** Helper used by reset & activation to consume a one-time token. */
  async consumeToken(email: string, token: string, action: "reset" | "activation") {
    const record = await prisma.authToken.findFirst({
      where: { email, token, action },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw AppError.unprocessable("Token tidak valid atau sudah kedaluwarsa");
    }

    return record;
  },

  async resetPassword(input: ResetPasswordInput) {
    if (input.new_password !== input.confirm_password) {
      throw AppError.unprocessable("Validation error", {
        confirm_password: "Konfirmasi password tidak cocok",
      });
    }
    if (!isStrongPassword(input.new_password)) {
      throw AppError.unprocessable("Validation error", {
        new_password: "Password tidak memenuhi kriteria",
      });
    }

    const record = await this.consumeToken(input.email, input.token, "reset");
    const password = await hashPassword(input.new_password);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: input.email },
        data: { password, statusCode: "ACTIVE" },
      }),
      prisma.authToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { status: 0, message: "Kata sandi berhasil diubah" };
  },

  async activate(input: ResetPasswordInput) {
    if (input.new_password !== input.confirm_password) {
      throw AppError.unprocessable("Validation error", {
        confirm_password: "Konfirmasi password tidak cocok",
      });
    }
    if (!isStrongPassword(input.new_password)) {
      throw AppError.unprocessable("Validation error", {
        new_password: "Password tidak memenuhi kriteria",
      });
    }

    const record = await this.consumeToken(input.email, input.token, "activation");
    const password = await hashPassword(input.new_password);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: input.email },
        data: { password, statusCode: "ACTIVE" },
      }),
      prisma.authToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { status: 0, message: "Akun berhasil diaktifkan" };
  },

  async validToken(input: ValidTokenInput) {
    await this.consumeToken(input.email, input.token, input.action);
    return { status: 0, message: "Token valid" };
  },

  async checkPassword(userId: string, password: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.unauthorized();

    const valid = await comparePassword(password, user.password);
    if (!valid) throw AppError.unprocessable("Kata sandi salah");

    return { status: 0, message: "Kata sandi valid" };
  },

  async changePassword(
    userId: string,
    input: ChangePasswordInput,
  ) {
    if (!isStrongPassword(input.new_password)) {
      throw AppError.unprocessable("Validation error", {
        new_password: "Password tidak memenuhi kriteria",
      });
    }

    const password = await hashPassword(input.new_password);
    await prisma.user.update({ where: { id: userId }, data: { password } });

    return { status: 0, message: "Kata sandi berhasil diubah" };
  },

  /** Create a one-time activation token and return the encrypted email link token. */
  async createActivationToken(email: string): Promise<string> {
    const token = generateToken();
    await prisma.authToken.create({
      data: {
        email,
        token,
        action: "activation",
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    });
    return encrypt({ email, token });
  },
};
