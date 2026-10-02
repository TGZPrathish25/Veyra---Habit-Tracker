/** Analytics query validation schemas. */
import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d']).optional().default('30d'),
});
