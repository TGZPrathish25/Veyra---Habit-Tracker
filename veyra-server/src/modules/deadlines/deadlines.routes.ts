/** Deadline monitoring — route definitions. */
import { Router } from 'express';
import { deadlinesController } from './deadlines.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const deadlinesRouter = Router();

deadlinesRouter.use(authenticate);

deadlinesRouter.get('/status', (req, res, next) => deadlinesController.getStatus(req, res, next));
