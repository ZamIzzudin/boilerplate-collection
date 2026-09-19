import { Router } from "express";
import { authenticate } from "@/common/middleware/authenticate";
import { validate } from "@/common/middleware/validate";
import {
  changePasswordSchema,
  checkEmailSchema,
  checkPasswordSchema,
  encryptedPayloadSchema,
  loginSchema,
} from "./auth.schema";
import { authController } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.post("/check", validate(checkEmailSchema), authController.checkEmail);
authRouter.get("/me", authenticate, authController.me);
authRouter.get("/events", authController.events);
authRouter.get("/profile", authenticate, authController.profile);
authRouter.get("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);

// User lifecycle (activation & password) — encrypted payloads.
authRouter.post(
  "/activation",
  validate(encryptedPayloadSchema),
  authController.activation,
);
authRouter.post(
  "/valid-token",
  validate(encryptedPayloadSchema),
  authController.validToken,
);
authRouter.post(
  "/check-password",
  authenticate,
  validate(checkPasswordSchema),
  authController.checkPassword,
);
authRouter.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);

// Alias: the frontend calls /user/* for lifecycle endpoints.
export const userAuthRouter = Router();
userAuthRouter.post(
  "/activation",
  validate(encryptedPayloadSchema),
  authController.activation,
);
userAuthRouter.post(
  "/valid-token",
  validate(encryptedPayloadSchema),
  authController.validToken,
);
userAuthRouter.post(
  "/check-password",
  authenticate,
  validate(checkPasswordSchema),
  authController.checkPassword,
);
userAuthRouter.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);
