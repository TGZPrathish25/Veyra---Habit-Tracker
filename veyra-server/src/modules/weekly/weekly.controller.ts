/** Weekly planning — request parsing and response formatting. */
import type { Request, Response, NextFunction } from 'express';
import { weeklyService } from './weekly.service.js';
import { createWeeklyPlanSchema, updateWeeklyPlanSchema } from './weekly.validators.js';
import { DEFAULT_TIMEZONE } from '../../lib/time.js';

export class WeeklyController {
  async getCurrentPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const weekStart = typeof req.query.weekStart === 'string' ? req.query.weekStart : undefined;
      const plan = await weeklyService.getCurrentPlan(
        req.user!.id,
        weekStart,
        req.user?.timezone || DEFAULT_TIMEZONE
      );
      res.json({
        status: 'success',
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  async savePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createWeeklyPlanSchema.parse(req.body);
      const plan = await weeklyService.savePlan(
        req.user!.id,
        data,
        req.user?.timezone || DEFAULT_TIMEZONE
      );
      res.json({
        status: 'success',
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateWeeklyPlanSchema.parse(req.body);
      const planId = req.params.id as string;
      const plan = await weeklyService.updatePlan(req.user!.id, planId, data);
      res.json({
        status: 'success',
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  async rollover(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await weeklyService.rolloverWeek(req.user!.id, req.user?.timezone || DEFAULT_TIMEZONE);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const weeklyController = new WeeklyController();
