import { AppError } from "@/common/errors";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { authService } from "@/modules/auth/auth.service";
import { sendMail } from "@/lib/mailer";
import { env } from "@/config/env";
import type {
  CreateUserInput,
  ListUserQuery,
  UpdateUserInput,
} from "./user.schema";

const toDto = (user: {
  id: string;
  username: string;
  email: string;
  userTypeId: number;
  userType: { id: number; name: string };
}) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: {
    id: String(user.userType.id),
    code: String(user.userType.id),
    name: user.userType.name,
  },
});

export const userService = {
  async list({ page, perPage, q }: ListUserQuery) {
    const where = q
      ? {
          OR: [
            { username: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [records, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { userType: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: records.map(toDto),
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  },

  async roleOptions() {
    const types = await prisma.userType.findMany({
      where: { statusCode: "ACTIVE" },
      orderBy: { id: "asc" },
    });

    return types.map((type) => ({
      id: String(type.id),
      code: String(type.id),
      name: type.name,
    }));
  },

  async create(input: CreateUserInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw AppError.unprocessable("Validation error", {
        email: "Email sudah terdaftar",
      });
    }

    const userType = await prisma.userType.findUnique({
      where: { id: Number(input.user_type_id) },
    });
    if (!userType) {
      throw AppError.unprocessable("Validation error", {
        user_type_id: "Role tidak ditemukan",
      });
    }

    const password = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        password,
        userTypeId: userType.id,
        statusCode: "PENDING",
      },
      include: { userType: true },
    });

    const activationToken = await authService.createActivationToken(user.email);
    const link = `${env.appUrl}/activation/${activationToken}`;
    await sendMail({
      to: user.email,
      subject: "Aktivasi Akun",
      html: `<p>Akun Anda telah dibuat. Klik tautan berikut untuk mengaktifkan akun dan mengatur kata sandi:</p><p><a href="${link}">${link}</a></p>`,
    });

    return toDto(user);
  },

  async update(id: string, input: UpdateUserInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound("User tidak ditemukan");

    const userType = await prisma.userType.findUnique({
      where: { id: Number(input.user_type_id) },
    });
    if (!userType) {
      throw AppError.unprocessable("Validation error", {
        user_type_id: "Role tidak ditemukan",
      });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        username: input.username,
        email: input.email,
        userTypeId: userType.id,
        ...(input.password ? { password: await hashPassword(input.password) } : {}),
      },
      include: { userType: true },
    });

    return toDto(updated);
  },

  async remove(id: string, requesterId: string) {
    if (id === requesterId) {
      throw AppError.unprocessable("Tidak dapat menghapus akun sendiri");
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound("User tidak ditemukan");

    await prisma.user.delete({ where: { id } });
    return { status: 0, message: "User berhasil dihapus" };
  },
};
