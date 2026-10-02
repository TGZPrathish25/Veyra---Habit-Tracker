/** Attaches a unique request ID for tracing. */
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const id = (req.headers['x-request-id'] as string) || randomUUID();
  res.setHeader('x-request-id', id);
  next();
};
