import jwt from "jsonwebtoken";
import { env } from "@/config/env";

export type TokenPayload = {
  sub: string;
  email: string;
  userTypeId: number;
  type: "access" | "refresh";
};

export const signAccessToken = (
  payload: Omit<TokenPayload, "type">,
): string =>
  jwt.sign({ ...payload, type: "access" }, env.jwtSecret, {
    expiresIn: env.accessTokenTtl,
  });

export const signRefreshToken = (
  payload: Omit<TokenPayload, "type">,
): string =>
  jwt.sign({ ...payload, type: "refresh" }, env.jwtSecret, {
    expiresIn: env.refreshTokenTtl,
  });

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
};
