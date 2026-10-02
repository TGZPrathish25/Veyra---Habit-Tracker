/** History route definitions. */
import { Router } from 'express';
import { historyController } from './history.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const historyRouter = Router();

historyRouter.use(authenticate);

historyRouter.get('/tree', (req, res, next) => historyController.getTree(req, res, next));
historyRouter.get('/:year/:month', (req, res, next) =>
  historyController.getMonthSnapshot(req, res, next)
);
