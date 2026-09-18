import type { Request, Response } from "express";
import { AppError } from "@/common/errors";
import { ok } from "@/common/http/response";
import { clearSessionCookies, getRefreshToken, setSessionCookies } from "@/lib/cookies";
import { decrypt } from "@/lib/crypto";
import { authService } from "./auth.service";
import type { z } from "zod";
import type {
  activationSchema,
  changePasswordSchema,
  checkPasswordSchema,
  encryptedPayloadSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  validTokenSchema,
} from "./auth.schema";

const decryptBody = <T,>(data: string): T => {
  try {
    return decrypt<T>(data);
  } catch {
    throw AppError.unprocessable("Payload tidak dapat didekripsi");
  }
};

export const authController = {
  async login(
    req: Request<unknown, unknown, z.infer<typeof loginSchema>>,
    res: Response,
  ) {
    const result = await authService.login(req.body);

    if (result.pending) {
      return res.status(200).json({ status: result.status, message: result.message });
    }

    setSessionCookies(res, result.accessToken, result.refreshToken);
    return res.status(200).json({
      status: 1,
      message: "Login berhasil",
      data: result.data,
    });
  },

  async checkEmail(
    req: Request<unknown, unknown, z.infer<typeof import("./auth.schema").checkEmailSchema>>,
    res: Response,
  ) {
    const result = await authService.checkEmail(req.body.email);
    return res.status(200).json(result);
  },

  async me(req: Request, res: Response) {
    const data = await authService.me(req.user!.id);
    return ok(res, data);
  },

  async profile(req: Request, res: Response) {
    const data = await authService.profile(req.user!.id);
    return ok(res, data);
  },

  refresh(req: Request, res: Response) {
    const refreshToken = getRefreshToken(req.cookies as Record<string, string>);
    const tokens = authService.refresh(refreshToken);
    setSessionCookies(res, tokens.accessToken, tokens.refreshToken);
    return ok(res, { refreshed: true });
  },

  logout(_req: Request, res: Response) {
    clearSessionCookies(res);
    return ok(res, { loggedOut: true });
  },

  async forgotPassword(
    req: Request<unknown, unknown, z.infer<typeof forgotPasswordSchema>>,
    res: Response,
  ) {
    const result = await authService.forgotPassword(req.body.email);
    return res.status(200).json(result);
  },

  async resetPassword(
    req: Request<unknown, unknown, z.infer<typeof encryptedPayloadSchema>>,
    res: Response,
  ) {
    const payload = decryptBody<z.infer<typeof resetPasswordSchema>>(req.body.data);
    const result = await authService.resetPassword(payload);
    return res.status(200).json(result);
  },

  async activation(
    req: Request<unknown, unknown, z.infer<typeof encryptedPayloadSchema>>,
    res: Response,
  ) {
    const payload = decryptBody<z.infer<typeof activationSchema>>(req.body.data);
    const result = await authService.activate(payload);
    return res.status(200).json(result);
  },

  async validToken(
    req: Request<unknown, unknown, z.infer<typeof encryptedPayloadSchema>>,
    res: Response,
  ) {
    const payload = decryptBody<z.infer<typeof validTokenSchema>>(req.body.data);
    const result = await authService.validToken(payload);
    return res.status(200).json(result);
  },

  async checkPassword(
    req: Request<unknown, unknown, z.infer<typeof checkPasswordSchema>>,
    res: Response,
  ) {
    const result = await authService.checkPassword(req.user!.id, req.body.password);
    return res.status(200).json(result);
  },

  async changePassword(
    req: Request<unknown, unknown, z.infer<typeof changePasswordSchema>>,
    res: Response,
  ) {
    const result = await authService.changePassword(req.user!.id, req.body);
    return res.status(200).json(result);
  },
};
