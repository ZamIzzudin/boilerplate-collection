import { Router } from "express";
import { authenticate } from "@/common/middleware/authenticate";
import { validate } from "@/common/middleware/validate";
import {
  changePasswordSchema,
  checkEmailSchema,
  checkPasswordSchema,
  encryptedPayloadSchema,
  forgotPasswordSchema,
  loginSchema,
} from "./auth.schema";
import { authController } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.post("/check", validate(checkEmailSchema), authController.checkEmail);
authRouter.get("/me", authenticate, authController.me);
authRouter.get("/profile", authenticate, authController.profile);
authRouter.get("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);

// User lifecycle (password & activation) — encrypted payloads.
authRouter.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
authRouter.post(
  "/reset-password",
  validate(encryptedPayloadSchema),
  authController.resetPassword,
);
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
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
userAuthRouter.post(
  "/reset-password",
  validate(encryptedPayloadSchema),
  authController.resetPassword,
);
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
