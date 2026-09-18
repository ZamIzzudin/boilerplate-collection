import { z } from "zod";

export const listUserTypeQuerySchema = z.object({
  type: z.enum(["list", "page"]).default("list"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(1000).default(1000),
  user_type_name: z.string().optional(),
  user_type_show_on_register: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value === true || value === "true",
    ),
});

export const roleSchema = z.object({
  id: z.union([z.string(), z.number()]),
  label: z.string().min(1, "Nama role wajib diisi"),
  user_type_show_on_register: z.boolean().default(false),
});

export const updateRoleSchema = roleSchema.partial().extend({
  label: z.string().min(1, "Nama role wajib diisi"),
});

export type ListUserTypeQuery = z.infer<typeof listUserTypeQuerySchema>;
export type RoleInput = z.infer<typeof roleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
