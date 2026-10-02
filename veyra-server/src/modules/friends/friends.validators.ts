/** Friend requests and privacy validation schemas. */
import { z } from 'zod';

export const sendFriendRequestSchema = z
  .object({
    targetUserId: z.string().min(1).optional(),
    targetUsername: z.string().min(2).max(30).optional(),
  })
  .refine((data) => data.targetUserId || data.targetUsername, {
    message: 'Either targetUserId or targetUsername must be provided',
  });

export const respondFriendRequestSchema = z.object({
  action: z.enum(['accept', 'reject']),
});

export const setPrivacyLevelSchema = z.object({
  privacyLevel: z.enum(['basic', 'counts', 'detailed', 'full']),
});
