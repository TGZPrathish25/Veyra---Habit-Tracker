/** History validation schemas. */
import { z } from 'zod';

export const historyMonthParamsSchema = z.object({
  year: z.coerce.number().int().min(2020).max(2035),
  month: z.coerce.number().int().min(1).max(12),
});
