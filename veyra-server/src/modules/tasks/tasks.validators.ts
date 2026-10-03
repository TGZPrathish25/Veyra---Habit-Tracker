/** Daily recurring task CRUD, occurrences, completion toggle — Zod validation schemas. */
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').nullable().optional(),
  emoji: z.string().max(10).nullable().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color').nullable().optional(),
  isRecurring: z.boolean().default(true),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6]),
  dueTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Due time must be HH:mm (24-hour)').nullable().optional(),
  dayDueTimes: z.record(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)).nullable().optional(),
  sortOrder: z.number().int().default(0),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(120).optional(),
  description: z.string().max(500).nullable().optional(),
  emoji: z.string().max(10).nullable().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color').nullable().optional(),
  isRecurring: z.boolean().optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  dueTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Due time must be HH:mm (24-hour)').nullable().optional(),
  dayDueTimes: z.record(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)).nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const getOccurrencesQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
});

export const toggleOccurrenceSchema = z.object({
  completed: z.boolean().optional(),
});
