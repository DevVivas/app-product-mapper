import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(120),
  providerId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
