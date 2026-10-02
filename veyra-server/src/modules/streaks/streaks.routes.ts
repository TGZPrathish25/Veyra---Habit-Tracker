/** Streaks — route definitions. */
import { Router } from 'express';
import { streaksController } from './streaks.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const streaksRouter = Router();

streaksRouter.use(authenticate);

streaksRouter.get('/', (req, res, next) => streaksController.getStreaks(req, res, next));
