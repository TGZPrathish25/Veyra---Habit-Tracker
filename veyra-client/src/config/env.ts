/** Zod-validated import.meta.env (VITE_*) — all env access goes through here. */
import { z } from 'zod';

const defaultBackendUrl = import.meta.env.DEV
  ? 'http://localhost:3001'
  : 'https://veyra-habit-tracker.onrender.com';

const envSchema = z.object({
  VITE_API_URL: z.string().default(defaultBackendUrl),
  VITE_SOCKET_URL: z.string().default(defaultBackendUrl),
  VITE_FIREBASE_API_KEY: z.string().default('AIzaSyBo4k8CdEJHtbs3H1UcF-xAw8CasiVS1AY'),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().default('veyra-25p10s.firebaseapp.com'),
  VITE_FIREBASE_PROJECT_ID: z.string().default('veyra-25p10s'),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().default('veyra-25p10s.firebasestorage.app'),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().default('456752188319'),
  VITE_FIREBASE_APP_ID: z.string().default('1:456752188319:web:40de74226ca5ddda830baa'),
});

export const env = envSchema.parse(import.meta.env);
