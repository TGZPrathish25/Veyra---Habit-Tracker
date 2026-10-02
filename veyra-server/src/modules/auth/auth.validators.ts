/** Session bootstrap, first-login user creation, token verification — Zod validation schemas. */
import { z } from 'zod';

export const syncUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100).optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable(),
  timezone: z.string().optional(),
});

export type SyncUserInput = z.infer<typeof syncUserSchema>;
