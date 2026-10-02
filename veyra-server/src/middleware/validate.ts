/** Zod validation middleware for body, query, and params. */
import type { Request, Response, NextFunction } from 'express';
import { z, type ZodSchema } from 'zod';
import { ValidationError } from '../lib/errors.js';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Record<string, string>;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Record<string, string>;
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError('Validation failed', error.flatten()));
      } else {
        next(error);
      }
    }
  };
};
