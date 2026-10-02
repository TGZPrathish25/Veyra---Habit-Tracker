import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const isDev = env.NODE_ENV === 'development';

export const defaultRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100000 : 600,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    req.path === '/health' ||
    req.path === '/api/v1/health' ||
    req.path === '/ping' ||
    req.path === '/' ||
    (isDev && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || req.hostname === 'localhost')),
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' } },
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    isDev && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || req.hostname === 'localhost'),
  message: { error: { code: 'RATE_LIMITED', message: 'Too many auth attempts' } },
});
