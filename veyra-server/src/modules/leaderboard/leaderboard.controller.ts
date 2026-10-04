/** Leaderboard controller — handles global ranking requests. */
import type { Request, Response, NextFunction } from 'express';
import { leaderboardService } from './leaderboard.service.js';
import type { LeaderboardSortMetric } from './leaderboard.types.js';

export class LeaderboardController {
  async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metric = (req.query.sortBy === 'streak' ? 'streak' : 'xp') as LeaderboardSortMetric;
      const limit = req.query.limit ? Math.min(Number(req.query.limit), 100) : 100;
      const entries = await leaderboardService.getLeaderboard(metric, limit);
      res.json({
        status: 'success',
        data: entries,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const leaderboardController = new LeaderboardController();
