/** Analytics controller — handlers for summary, trends, and heatmaps. */
import type { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service.js';
import { analyticsQuerySchema } from './analytics.validators.js';

export class AnalyticsController {
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period } = analyticsQuerySchema.parse(req.query);
      const summary = await analyticsService.getSummary(req.user!.id, period);
      res.json({
        status: 'success',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHeatmap(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 60;
      const heatmap = await analyticsService.getHeatmap(req.user!.id, days);
      res.json({
        status: 'success',
        data: heatmap,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
