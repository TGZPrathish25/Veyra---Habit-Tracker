/** Gamification & achievements — request parsing and response formatting. */
import type { Request, Response, NextFunction } from 'express';
import { gamificationService } from './gamification.service.js';

export class GamificationController {
  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await gamificationService.getStatus(req.user!.id);
      res.json({
        status: 'success',
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const achievements = await gamificationService.getAchievements(req.user!.id);
      res.json({
        status: 'success',
        data: achievements,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const gamificationController = new GamificationController();
