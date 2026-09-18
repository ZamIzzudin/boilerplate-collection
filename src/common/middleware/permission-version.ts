import type { NextFunction, Request, Response } from "express";
import { prisma } from "@/lib/prisma";

const PERM_VERSION_KEY = "perm_version";

/**
 * Cache of the current permission version. Invalidated whenever menus,
 * actions or privileges change (see bumpPermissionVersion).
 */
let cachedVersion: string | null = null;

export const getPermissionVersion = async (): Promise<string> => {
  if (cachedVersion) return cachedVersion;

  const setting = await prisma.setting.findUnique({
    where: { key: PERM_VERSION_KEY },
  });

  cachedVersion = setting?.value ?? "1";
  return cachedVersion;
};

/** Bump the global permission version so clients refresh their privileges. */
export const bumpPermissionVersion = async (): Promise<string> => {
  const next = String(Date.now());
  await prisma.setting.upsert({
    where: { key: PERM_VERSION_KEY },
    create: { key: PERM_VERSION_KEY, value: next },
    update: { value: next },
  });
  cachedVersion = next;
  return next;
};

/** Only used in tests to reset module-level cache. */
export const resetPermissionVersionCache = (): void => {
  cachedVersion = null;
};

/**
 * Adds the `x-perm-version` response header to every response. The frontend
 * compares it against its stored version and refreshes privileges if changed.
 */
export const permissionVersionMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.setHeader("Access-Control-Expose-Headers", "x-perm-version");
  getPermissionVersion()
    .then((version) => res.setHeader("x-perm-version", version))
    .catch(() => res.setHeader("x-perm-version", "1"))
    .finally(() => next());
};
