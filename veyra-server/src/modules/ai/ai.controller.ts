/** AI controller — HTTP request handlers for reflections and insights. */
import type { Request, Response, NextFunction } from 'express';
import { aiService } from './ai.service.js';
import { generateReflectionSchema, getInsightsQuerySchema } from './ai.validators.js';

export const aiController = {
  async generateReflection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const parsed = generateReflectionSchema.parse(req.body);

      const data = await aiService.generateMonthlyReflection(userId, parsed);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const query = getInsightsQuerySchema.parse(req.query);

      const data = await aiService.getProductivityInsights(userId, query.days);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
