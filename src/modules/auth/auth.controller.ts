import type { Request, Response } from "express";
import { AppError } from "@/common/errors";
import { getPermissionVersion } from "@/common/middleware/permission-version";
import { ok } from "@/common/http/response";
import { clearSessionCookies, getRefreshToken, setSessionCookies } from "@/lib/cookies";
import { decrypt } from "@/lib/crypto";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { registerSseClient } from "@/lib/sse";
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

  /**
   * SSE stream of permission-version updates so the frontend can refresh
   * privileges the moment an admin changes them — no polling.
   *
   * Authenticated with the long-lived refresh-token cookie (not the 30-minute
   * access token) so the stream survives token rotation without reconnect
   * churn. EventSource cannot send headers, but cookies are attached with
   * `withCredentials`, which the browser already does for axios here.
   */
  async events(req: Request, res: Response) {
    const unauthorized = (): void => {
      res.status(401).json({
        status: 401,
        message: "Session not found",
      });
    };

    const refreshToken = getRefreshToken(req.cookies as Record<string, string>);
    if (!refreshToken) return unauthorized();

    const payload = verifyToken(refreshToken);
    if (!payload || payload.type !== "refresh") return unauthorized();

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.statusCode !== "ACTIVE") return unauthorized();

    res.status(200).set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders();

    // Ask the browser to reconnect automatically on network drops, and send
    // the current version right away so a reconnecting client never misses
    // a bump (it compares against its stored version anyway).
    res.write("retry: 10000\n\n");
    const version = await getPermissionVersion();
    res.write(`event: perm-version\ndata: ${version}\n\n`);

    const unregister = registerSseClient(res);
    req.on("close", unregister);
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
