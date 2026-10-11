import { z } from "zod";
import { paginationSchema } from "./common.validator";

export const createProviderSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export const updateProviderSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
});

export const providerListQuerySchema = paginationSchema.extend({
  q: z.string().trim().max(120).optional(),
});

export type CreateProviderInput = z.infer<typeof createProviderSchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;
export type ProviderListQuery = z.infer<typeof providerListQuerySchema>;