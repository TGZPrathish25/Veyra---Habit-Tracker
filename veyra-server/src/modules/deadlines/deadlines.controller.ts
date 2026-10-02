/** Deadline monitoring — request parsing and response formatting. */
import type { Request, Response, NextFunction } from 'express';
import { deadlinesService } from './deadlines.service.js';

export class DeadlinesController {
  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await deadlinesService.getStatusForUser(req.user!.id);
      res.json({
        status: 'success',
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const deadlinesController = new DeadlinesController();
