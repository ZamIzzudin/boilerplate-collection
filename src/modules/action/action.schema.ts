import { z } from "zod";

export const listActionQuerySchema = z.object({
  type: z.enum(["list", "page"]).default("page"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(1000).default(15),
  action_name: z.string().optional(),
});

export const createActionSchema = z.object({
  action_code: z.string().optional(),
  action_name: z.string().min(1, "Nama action wajib diisi"),
});

export const updateActionSchema = z.object({
  action_name: z.string().min(1, "Nama action wajib diisi"),
});

export type ListActionQuery = z.infer<typeof listActionQuerySchema>;
export type CreateActionInput = z.infer<typeof createActionSchema>;
export type UpdateActionInput = z.infer<typeof updateActionSchema>;
