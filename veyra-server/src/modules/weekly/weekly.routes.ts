/** Weekly planning — route definitions. */
import { Router } from 'express';
import { weeklyController } from './weekly.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const weeklyRouter = Router();

weeklyRouter.use(authenticate);

weeklyRouter.get('/current', (req, res, next) => weeklyController.getCurrentPlan(req, res, next));
weeklyRouter.post('/', (req, res, next) => weeklyController.savePlan(req, res, next));
weeklyRouter.patch('/:id', (req, res, next) => weeklyController.updatePlan(req, res, next));
weeklyRouter.post('/rollover', (req, res, next) => weeklyController.rollover(req, res, next));
