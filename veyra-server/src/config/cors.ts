/** CORS configuration using CLIENT_ORIGIN from env. */
import cors from 'cors';
import { env } from './env.js';

export const corsOptions: cors.CorsOptions = {
  origin: env.CLIENT_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
