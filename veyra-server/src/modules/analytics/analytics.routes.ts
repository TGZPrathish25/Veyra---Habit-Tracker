/** Analytics route definitions. */
import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const analyticsRouter = Router();

analyticsRouter.use(authenticate);

analyticsRouter.get('/summary', (req, res, next) => analyticsController.getSummary(req, res, next));
analyticsRouter.get('/heatmap', (req, res, next) => analyticsController.getHeatmap(req, res, next));
analyticsRouter.get('/', (req, res, next) => analyticsController.getSummary(req, res, next));
