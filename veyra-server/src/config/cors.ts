/** CORS configuration using CLIENT_ORIGIN from env (supports comma-separated list). */
import cors from 'cors';
import { env } from './env.js';

const allowedOrigins = env.CLIENT_ORIGIN.split(',').map((o) => o.trim());

export const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

