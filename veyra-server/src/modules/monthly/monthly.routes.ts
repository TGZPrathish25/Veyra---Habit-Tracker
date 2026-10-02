/** Monthly goals & planning — route definitions. */
import { Router } from 'express';
import { monthlyController } from './monthly.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const monthlyRouter = Router();

monthlyRouter.use(authenticate);

monthlyRouter.get('/current', (req, res, next) => monthlyController.getCurrentPlan(req, res, next));
monthlyRouter.post('/', (req, res, next) => monthlyController.savePlan(req, res, next));
monthlyRouter.patch('/:id', (req, res, next) => monthlyController.updatePlan(req, res, next));
monthlyRouter.post('/lock', (req, res, next) => monthlyController.lockMonth(req, res, next));
