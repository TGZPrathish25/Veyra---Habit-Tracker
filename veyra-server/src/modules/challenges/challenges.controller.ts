/** Challenges controller — endpoints for listing, creating, joining, and logging progress. */
import type { Request, Response, NextFunction } from 'express';
import { challengesService } from './challenges.service.js';
import { createChallengeSchema, updateChallengeProgressSchema } from './challenges.validators.js';

export class ChallengesController {
  async listChallenges(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filter = req.query.filter as 'all' | 'active' | 'my' | undefined;
      const challenges = await challengesService.listChallenges(req.user?.id, filter);
      res.json({
        status: 'success',
        data: challenges,
      });
    } catch (error) {
      next(error);
    }
  }

  async getChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const data = await challengesService.getChallenge(id, req.user?.id);
      res.json({
        status: 'success',
        data: data.challenge,
        meta: {
          participants: data.participants,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createChallengeSchema.parse(req.body);
      const creatorName = req.user?.name || req.user?.username || 'Creator';
      const challenge = await challengesService.createChallenge(req.user!.id, creatorName, input);
      res.status(201).json({
        status: 'success',
        data: challenge,
      });
    } catch (error) {
      next(error);
    }
  }

  async joinChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userName = req.user?.name || req.user?.username || 'Participant';
      const participant = await challengesService.joinChallenge(id, req.user!.id, userName);
      res.json({
        status: 'success',
        data: participant,
      });
    } catch (error) {
      next(error);
    }
  }

  async leaveChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await challengesService.leaveChallenge(id, req.user!.id);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const input = updateChallengeProgressSchema.parse(req.body);
      const result = await challengesService.updateProgress(id, req.user!.id, input);
      res.json({
        status: 'success',
        data: result.participant,
        meta: {
          xpAwarded: result.xpAwarded,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const challengesController = new ChallengesController();
