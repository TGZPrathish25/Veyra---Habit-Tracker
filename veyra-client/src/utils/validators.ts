/** Shared Zod validation schemas. */
import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const usernameSchema = z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores');
