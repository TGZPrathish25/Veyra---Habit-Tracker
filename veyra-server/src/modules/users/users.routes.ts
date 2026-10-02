/** User profile, username availability, settings — route definitions. */
import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { updateProfileSchema, updateSettingsSchema, checkUsernameParamsSchema } from './users.validators.js';

export const usersRouter = Router();

usersRouter.get('/me', authenticate, usersController.getMe);
usersRouter.patch('/me', authenticate, validate({ body: updateProfileSchema }), usersController.updateMe);
usersRouter.get('/me/settings', authenticate, usersController.getSettings);
usersRouter.patch('/me/settings', authenticate, validate({ body: updateSettingsSchema }), usersController.updateSettings);
usersRouter.get('/check-username/:username', validate({ params: checkUsernameParamsSchema }), usersController.checkUsername);
