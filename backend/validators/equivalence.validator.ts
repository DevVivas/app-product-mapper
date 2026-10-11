import { z } from "zod";
import { paginationSchema } from "./common.validator";

export const createEquivalenceSchema = z.object({
  providerId: z.number().int().positive(),
  providerCode: z.string().trim().min(1).max(80),
  providerName: z.string().trim().min(1).max(200),
  localProductId: z.number().int().positive(),
});

export const updateEquivalenceSchema = createEquivalenceSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Debe enviar al menos un campo para actualizar"
);

export const equivalenceListQuerySchema = paginationSchema.extend({
  q: z.string().trim().max(120).optional(),
  providerId: z.coerce.number().int().positive().optional(),
});

export type CreateEquivalenceInput = z.infer<typeof createEquivalenceSchema>;
export type UpdateEquivalenceInput = z.infer<typeof updateEquivalenceSchema>;
export type EquivalenceListQuery = z.infer<typeof equivalenceListQuerySchema>;