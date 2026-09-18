import { z } from "zod";

export const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/\d/, "Password harus mengandung angka")
      .regex(/[A-Z]/, "Password harus mengandung huruf besar")
      .regex(/[a-z]/, "Password harus mengandung huruf kecil")
      .regex(
        /[!@#$%^&*]/,
        "Password harus mengandung karakter khusus (!@#$%^&*)",
      ),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type PasswordFormData = z.infer<typeof passwordSchema>;
