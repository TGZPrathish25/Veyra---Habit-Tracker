/** User notifications management — route definitions. */
import { Router } from 'express';
import { notificationsController } from './notifications.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

notificationsRouter.get('/', notificationsController.getNotifications);
notificationsRouter.post('/daily-reminder', notificationsController.triggerDailyReminder);
notificationsRouter.patch('/:id/read', notificationsController.markAsRead);
notificationsRouter.post('/mark-all-read', notificationsController.markAllAsRead);
notificationsRouter.delete('/:id', notificationsController.deleteNotification);
