import { z } from "zod";
import { requiredString } from "@/lib/validation";

export const loginSchema = z.object({
  email: z.email("Email tidak valid"),
  password: requiredString("Password"),
  captcha: z.string().optional(),
  userTypeId: requiredString("Jenis user"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Email tidak valid"),
  userTypeId: requiredString("Jenis user"),
});
