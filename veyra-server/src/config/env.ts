/** Zod-validated environment variables. Crashes on invalid config at startup. */
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  FIREBASE_SERVICE_ACCOUNT: z.string().default(''),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  GEMINI_API_KEY: z.string().optional(),
  ALLOW_DEV_AUTH: z.string().default('true').transform((v) => v.toLowerCase() === 'true'),
  APP_TIMEZONE: z.string().default('Asia/Kolkata'),
  SESSION_SECRET: z.string().default('veyra-secure-session-secret-2025-habit-tracker-key'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const env = validateEnv();
