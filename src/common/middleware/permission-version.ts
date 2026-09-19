import type { NextFunction, Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { broadcastPermVersion } from "@/lib/sse";

const PERM_VERSION_KEY = "perm_version";

/**
 * Current permission version, read straight from the database on every call.
 * No in-process cache: any instance behind a load balancer serves the same
 * value without needing Redis or sticky sessions.
 */
export const getPermissionVersion = async (): Promise<string> => {
  const setting = await prisma.setting.findUnique({
    where: { key: PERM_VERSION_KEY },
  });
  return setting?.value ?? "1";
};

/**
 * Bump the global permission version. Open SSE streams are notified
 * immediately (see /auth/events); every other response picks the new value
 * up from the database via the x-perm-version header.
 */
export const bumpPermissionVersion = async (): Promise<string> => {
  const next = String(Date.now());
  await prisma.setting.upsert({
    where: { key: PERM_VERSION_KEY },
    create: { key: PERM_VERSION_KEY, value: next },
    update: { value: next },
  });
  broadcastPermVersion(next);
  return next;
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
