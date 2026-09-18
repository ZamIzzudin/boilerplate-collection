import { z } from "zod";

export const privilegeEntrySchema = z.object({
  privilege_code: z.string().optional(),
  menu_code: z.string().min(1),
  action_code: z.string().min(1),
  status_code: z.string().default("ACTIVE"),
});

export const updatePrivilegeSchema = z.object({
  user_type_id: z.union([z.string(), z.number()]).transform(String),
  privileges: z.array(privilegeEntrySchema),
});

export type PrivilegeEntryInput = z.infer<typeof privilegeEntrySchema>;
export type UpdatePrivilegeInput = z.infer<typeof updatePrivilegeSchema>;
