/** Session bootstrap, first-login user creation, token verification — route definitions. */
import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { syncUserSchema } from './auth.validators.js';

export const authRouter = Router();

authRouter.post('/sync', authenticate, validate({ body: syncUserSchema }), authController.sync);
authRouter.get('/me', authenticate, authController.me);
authRouter.post('/logout', authenticate, authController.logout);
