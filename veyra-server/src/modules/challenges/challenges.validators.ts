/** Validation schemas for challenges creation, joining, and progress updating. */
import { z } from 'zod';

export const createChallengeSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['daily_streak', 'task_count', 'custom']),
  targetValue: z.number().int().positive().max(1000),
  rewardXp: z.number().int().nonnegative().max(10000).optional().default(150),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD'),
  isPublic: z.boolean().optional().default(true),
});

export const updateChallengeProgressSchema = z.object({
  increment: z.number().int().optional(),
  progress: z.number().int().nonnegative().optional(),
});
