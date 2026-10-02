/** User profile, username availability, settings — Zod validation schemas. */
import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(100).optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable(),
  timezone: z.string().min(1, 'Timezone cannot be empty').optional(),
});

export const updateSettingsSchema = z.object({
  theme: z.enum(['dark', 'light', 'ambient', 'system']).optional(),
  friendVisibilityLevel: z.number().int().min(1).max(4).optional(),
  leaderboardOptIn: z.boolean().optional(),
  deadlineAlertPrefs: z.record(z.unknown()).optional(),
  notificationPrefs: z.record(z.unknown()).optional(),
  challengePrefs: z.record(z.unknown()).optional(),
  weekStartDay: z.number().int().min(0).max(6).optional(),
});

export const checkUsernameParamsSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
