/** Monthly goals — request parsing and response formatting. */
import type { Request, Response, NextFunction } from 'express';
import { monthlyService } from './monthly.service.js';
import { createMonthlyPlanSchema, updateMonthlyPlanSchema } from './monthly.validators.js';
import { DEFAULT_TIMEZONE } from '../../lib/time.js';

export class MonthlyController {
  async getCurrentPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = req.query.year ? Number(req.query.year) : undefined;
      const month = req.query.month ? Number(req.query.month) : undefined;
      const plan = await monthlyService.getCurrentPlan(
        req.user!.id,
        year,
        month,
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
      const data = createMonthlyPlanSchema.parse(req.body);
      const plan = await monthlyService.savePlan(
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
      const data = updateMonthlyPlanSchema.parse(req.body);
      const planId = req.params.id as string;
      const plan = await monthlyService.updatePlan(req.user!.id, planId, data);
      res.json({
        status: 'success',
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  async lockMonth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = Number(req.body.year);
      const month = Number(req.body.month);
      const result = await monthlyService.lockMonth(req.user!.id, year, month, req.body.stats);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const monthlyController = new MonthlyController();
