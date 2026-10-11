import { z } from "zod";
import { paginationSchema } from "./common.validator";

export const createLocalProductSchema = z.object({
  code: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(200),
});

export const updateLocalProductSchema = z.object({
  code: z.string().trim().min(1).max(80).optional(),
  name: z.string().trim().min(1).max(200).optional(),
});

export const localProductListQuerySchema = paginationSchema.extend({
  q: z.string().trim().max(120).optional(),
});

export type CreateLocalProductInput = z.infer<typeof createLocalProductSchema>;
export type UpdateLocalProductInput = z.infer<typeof updateLocalProductSchema>;
export type LocalProductListQuery = z.infer<typeof localProductListQuerySchema>;