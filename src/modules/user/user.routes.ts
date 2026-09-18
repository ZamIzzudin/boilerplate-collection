import { Router } from "express";
import { authenticate } from "@/common/middleware/authenticate";
import { validate } from "@/common/middleware/validate";
import { AppError } from "@/common/errors";
import { ok } from "@/common/http/response";
import { prisma } from "@/lib/prisma";
import {
  createUserSchema,
  listUserQuerySchema,
  updateUserSchema,
} from "./user.schema";
import { userService } from "./user.service";

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get(
  "/",
  validate(listUserQuerySchema, "query"),
  async (req, res, next) => {
    try {
      const query = (req.validQuery ?? req.query) as unknown as Parameters<
        typeof userService.list
      >[0];
      const result = await userService.list(query);
      res.status(200).json({ status: 1, message: "Success", ...result });
    } catch (error) {
      next(error);
    }
  },
);

userRouter.get("/role-options", async (_req, res, next) => {
  try {
    const options = await userService.roleOptions();
    return res.status(200).json(options);
  } catch (error) {
    next(error);
  }
});

userRouter.post("/", validate(createUserSchema), async (req, res, next) => {
  try {
    const user = await userService.create(req.body);
    return res.status(201).json({ status: 1, message: "User berhasil dibuat", data: user });
  } catch (error) {
    next(error);
  }
});

userRouter.put("/:id", validate(updateUserSchema), async (req, res, next) => {
  try {
    const user = await userService.update(String(req.params.id), req.body);
    return ok(res, user, "User berhasil diperbarui");
  } catch (error) {
    next(error);
  }
});

userRouter.delete("/:id", async (req, res, next) => {
  try {
    const result = await userService.remove(String(req.params.id), req.user!.id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Avatar/file endpoint. The boilerplate has no file storage yet, so it
 * returns an empty image. Swap with a real storage implementation.
 */
userRouter.get("/:id/file", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw AppError.notFound("User tidak ditemukan");

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(Buffer.alloc(0));
  } catch (error) {
    next(error);
  }
});
