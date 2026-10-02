/** History controller — handlers for archive tree and month snapshot views. */
import type { Request, Response, NextFunction } from 'express';
import { historyService } from './history.service.js';
import { historyMonthParamsSchema } from './history.validators.js';

export class HistoryController {
  async getTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tree = await historyService.getTree(req.user!.id);
      res.json({
        status: 'success',
        data: tree,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMonthSnapshot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { year, month } = historyMonthParamsSchema.parse(req.params);
      const snapshot = await historyService.getMonthSnapshot(req.user!.id, year, month);
      res.json({
        status: 'success',
        data: snapshot,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const historyController = new HistoryController();
