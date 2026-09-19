import { z } from "zod";
import { requiredString } from "@/lib/validation";

export const loginSchema = z.object({
  email: z.email("Email tidak valid"),
  password: requiredString("Password"),
  captcha: z.string().optional(),
});
