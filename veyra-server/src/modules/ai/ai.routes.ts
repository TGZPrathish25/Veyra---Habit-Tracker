/** AI routes — productivity reflections and insights. */
import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const aiRouter = Router();

aiRouter.use(authenticate);

aiRouter.post('/reflection', aiController.generateReflection);
aiRouter.get('/insights', aiController.getInsights);
