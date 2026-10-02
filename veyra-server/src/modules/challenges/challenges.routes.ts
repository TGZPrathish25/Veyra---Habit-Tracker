/** Challenges routes — creation, participation, and progress logging. */
import { Router } from 'express';
import { challengesController } from './challenges.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const challengesRouter = Router();

challengesRouter.use(authenticate);

challengesRouter.get('/', (req, res, next) => challengesController.listChallenges(req, res, next));
challengesRouter.post('/', (req, res, next) => challengesController.createChallenge(req, res, next));

challengesRouter.get('/:id', (req, res, next) => challengesController.getChallenge(req, res, next));
challengesRouter.post('/:id/join', (req, res, next) => challengesController.joinChallenge(req, res, next));
challengesRouter.post('/:id/leave', (req, res, next) => challengesController.leaveChallenge(req, res, next));
challengesRouter.post('/:id/progress', (req, res, next) =>
  challengesController.updateProgress(req, res, next)
);
