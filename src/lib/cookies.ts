import type { CookieOptions, Response } from "express";
import { env } from "@/config/env";

const baseOptions = (maxAgeSeconds: number): CookieOptions => ({
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: "lax",
  domain: env.cookieDomain,
  path: "/",
  maxAge: maxAgeSeconds * 1000,
});

/** Set the long-lived refresh token session cookie. */
export const setSessionCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
): void => {
  res.cookie(env.accessCookieName, accessToken, baseOptions(env.accessTokenTtl));
  res.cookie(
    env.sessionCookieName,
    refreshToken,
    baseOptions(env.refreshTokenTtl),
  );
};

export const clearSessionCookies = (res: Response): void => {
  const options: CookieOptions = {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: "lax",
    domain: env.cookieDomain,
    path: "/",
  };
  res.clearCookie(env.accessCookieName, options);
  res.clearCookie(env.sessionCookieName, options);
};

export const getRefreshToken = (cookies: Record<string, string>): string | undefined =>
  cookies[env.sessionCookieName];
