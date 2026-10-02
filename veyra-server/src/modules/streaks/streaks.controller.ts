/** Streaks — request parsing and response formatting. */
import type { Request, Response, NextFunction } from 'express';
import { streaksService } from './streaks.service.js';

export class StreaksController {
  async getStreaks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const streaks = await streaksService.getUserStreaks(req.user!.id);
      res.json({
        status: 'success',
        data: streaks,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const streaksController = new StreaksController();
