import { z } from "zod";
import { requiredString, passwordField } from "@/lib/validation";

export const verifyPasswordSchema = z.object({
  currentPassword: requiredString("Kata sandi"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordField("Kata sandi baru"),
    confirmPassword: requiredString("Ulangi kata sandi baru"),
  })
  .refine(
    (data) => {
      return data.newPassword === data.confirmPassword;
    },
    {
      message: "Kata sandi tidak sesuai",
      path: ["confirmPassword"],
    },
  );
