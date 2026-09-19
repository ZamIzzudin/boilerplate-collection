import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/common/errors";
import { prisma } from "@/lib/prisma";

/**
 * Role based access control guard.
 * Usage: `router.get("/users", authenticate, authorize("ACT_LIST", "MNU_USER"), handler)`
 *
 * A privilege is granted when an ACTIVE privilege row exists for the user's
 * user-type, menu and action.
 */
export const authorize =
  (actionCode: string, menuCode: string) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const userTypeId = req.user?.userTypeId;
      if (!userTypeId) throw AppError.unauthorized();

      const privilege = await prisma.privilege.findFirst({
        where: {
          userTypeId,
          actionCode,
          menuCode,
          statusCode: "ACTIVE",
        },
      });

      if (!privilege) throw AppError.forbidden("You do not have access");
      next();
    } catch (error) {
      next(error);
    }
  };
