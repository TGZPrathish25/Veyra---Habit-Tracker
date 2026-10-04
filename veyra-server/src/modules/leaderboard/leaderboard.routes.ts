/** Global leaderboard — route definitions. */
import { Router } from 'express';
import { leaderboardController } from './leaderboard.controller.js';

export const leaderboardRouter = Router();

leaderboardRouter.get('/', (req, res, next) => leaderboardController.getLeaderboard(req, res, next));
