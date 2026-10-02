/** Zod-validated import.meta.env (VITE_*) — all env access goes through here. */
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().default('http://localhost:3001'),
  VITE_SOCKET_URL: z.string().default('http://localhost:3001'),
  VITE_FIREBASE_API_KEY: z.string().default(''),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().default(''),
  VITE_FIREBASE_PROJECT_ID: z.string().default(''),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().default(''),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().default(''),
  VITE_FIREBASE_APP_ID: z.string().default(''),
});

export const env = envSchema.parse(import.meta.env);
