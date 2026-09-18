import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const checkEmailSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
  submitted_by_admin: z.boolean().optional().default(false),
});

export const encryptedPayloadSchema = z.object({
  data: z.string().min(1, "Payload wajib diisi"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  new_password: z.string().min(1),
  confirm_password: z.string().min(1),
});

export const activationSchema = resetPasswordSchema;

export const validTokenSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  action: z.enum(["activation", "reset"]),
});

export const checkPasswordSchema = z.object({
  password: z.string().min(1, "Password wajib diisi"),
});

export const changePasswordSchema = z
  .object({
    new_password: z.string().min(8, "Password minimal 8 karakter"),
    confirm_password: z.string().min(1),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirm_password"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ValidTokenInput = z.infer<typeof validTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CheckPasswordInput = z.infer<typeof checkPasswordSchema>;
