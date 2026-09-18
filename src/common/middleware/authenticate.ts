import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/common/errors";
import { env } from "@/config/env";
import { verifyToken, type TokenPayload } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string; userTypeId: number };
      tokenPayload?: TokenPayload;
      validQuery?: unknown;
    }
  }
}

/**
 * Authenticate a request from the httpOnly access-token cookie.
 * Returns 401 so the frontend axios interceptor triggers /auth/refresh.
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies?.[env.accessCookieName] as string | undefined;
    if (!token) throw AppError.unauthorized("Session not found");

    const payload = verifyToken(token);
    if (!payload || payload.type !== "access") {
      throw AppError.unauthorized("Session expired");
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.statusCode !== "ACTIVE") {
      throw AppError.unauthorized("Account is not active");
    }

    req.user = {
      id: user.id,
      email: user.email,
      userTypeId: user.userTypeId,
    };
    req.tokenPayload = payload;
    next();
  } catch (error) {
    next(error);
  }
};
