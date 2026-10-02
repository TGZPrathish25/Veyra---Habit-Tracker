/** Monthly goals module — Zod validation schemas. */
import { z } from 'zod';

export const monthlyGoalItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Goal title is required').max(150),
  category: z.string().max(50).optional(),
  targetCount: z.number().int().min(1).default(1),
  completedCount: z.number().int().min(0).default(0),
  completed: z.boolean().default(false),
});

export const createMonthlyPlanSchema = z.object({
  year: z.number().int().min(2020).max(2050).optional(),
  month: z.number().int().min(1).max(12).optional(),
  goals: z.array(monthlyGoalItemSchema).default([]),
  reflection: z.string().max(3000).nullable().optional(),
});

export const updateMonthlyPlanSchema = z.object({
  goals: z.array(monthlyGoalItemSchema).optional(),
  reflection: z.string().max(3000).nullable().optional(),
  isLocked: z.boolean().optional(),
});
