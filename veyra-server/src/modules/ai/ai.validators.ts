/** AI module — Zod validation schemas. */
import { z } from 'zod';

export const generateReflectionSchema = z.object({
  year: z.number().int().min(2020).max(2050),
  month: z.number().int().min(1).max(12),
  customPrompt: z.string().max(500).optional(),
});

export const getInsightsQuerySchema = z.object({
  days: z.coerce.number().int().min(7).max(90).default(30),
});
