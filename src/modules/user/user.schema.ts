import { z } from "zod";

const password = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .regex(/\d/, "Password harus mengandung angka")
  .regex(/[A-Z]/, "Password harus mengandung huruf besar")
  .regex(/[a-z]/, "Password harus mengandung huruf kecil")
  .regex(/[!@#$%^&*]/, "Password harus mengandung karakter khusus (!@#$%^&*)");

export const createUserSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password,
  user_type_id: z.union([z.string(), z.number()]).transform(String),
});

export const updateUserSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: password.optional(),
  user_type_id: z.union([z.string(), z.number()]).transform(String),
});

export const listUserQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(1000).default(15),
  q: z.string().optional().default(""),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUserQuery = z.infer<typeof listUserQuerySchema>;
