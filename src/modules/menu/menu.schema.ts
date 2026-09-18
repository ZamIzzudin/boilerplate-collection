import { z } from "zod";

export const listMenuQuerySchema = z.object({
  type: z.enum(["list", "page"]).default("page"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(1000).default(15),
  menu_name: z.string().optional(),
});

export const menuActionSchema = z.object({
  action_code: z.string().min(1),
  status_code: z.string().default("ACTIVE"),
});

export const createMenuSchema = z.object({
  menu_code: z.string().optional(),
  menu_name: z.string().min(1, "Nama menu wajib diisi"),
  parent_code: z.string().nullable().optional().default(null),
  icon: z.string().optional().default(""),
  slug: z.string().optional().default(""),
  order: z.coerce.number().int().default(0),
  is_group: z.boolean().optional().default(false),
  action: z.array(menuActionSchema).optional().default([]),
});

export const updateMenuSchema = createMenuSchema;

export type ListMenuQuery = z.infer<typeof listMenuQuerySchema>;
export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
export type MenuActionInput = z.infer<typeof menuActionSchema>;
