/** User notifications management — Zod validation schemas. */
import { z } from 'zod';

export const listNotificationsQuerySchema = z.object({
  unreadOnly: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().min(1).max(50).default(30),
});

export const notificationIdParamSchema = z.object({
  id: z.string().min(1),
});

export const createNotificationSchema = z.object({
  type: z.enum([
    'friend_request',
    'challenge_invite',
    'achievement',
    'streak',
    'deadline_urgent',
    'system',
  ]),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(500),
  data: z.record(z.unknown()).optional(),
});
