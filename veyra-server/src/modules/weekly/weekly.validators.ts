/** Weekly planning module — Zod validation schemas. */
import { z } from 'zod';

export const weeklyGoalItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Goal title is required').max(150),
  category: z.string().max(50).optional(),
  targetCount: z.number().int().min(1).default(1),
  completedCount: z.number().int().min(0).default(0),
  completed: z.boolean().default(false),
});

export const createWeeklyPlanSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  goals: z.array(weeklyGoalItemSchema).default([]),
  reflection: z.string().max(2000).nullable().optional(),
});

export const updateWeeklyPlanSchema = z.object({
  goals: z.array(weeklyGoalItemSchema).optional(),
  reflection: z.string().max(2000).nullable().optional(),
  isLocked: z.boolean().optional(),
});
