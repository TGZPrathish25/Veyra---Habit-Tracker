/** Gamification & achievements — route definitions. */
import { Router } from 'express';
import { gamificationController } from './gamification.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const gamificationRouter = Router();

gamificationRouter.use(authenticate);

gamificationRouter.get('/status', (req, res, next) => gamificationController.getStatus(req, res, next));
gamificationRouter.get('/achievements', (req, res, next) => gamificationController.getAchievements(req, res, next));
