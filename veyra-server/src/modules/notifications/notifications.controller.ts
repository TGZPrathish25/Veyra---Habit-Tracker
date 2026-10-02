/** User notifications controller — HTTP request handlers. */
import type { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service.js';

export const notificationsController = {
  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const unreadOnly = req.query.unreadOnly === 'true';
      const limit = req.query.limit ? Number(req.query.limit) : 30;

      const data = await notificationsService.getNotifications(userId, unreadOnly, limit);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const id = req.params.id as string;

      const updated = await notificationsService.markAsRead(id, userId);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const result = await notificationsService.markAllAsRead(userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const id = req.params.id as string;

      const deleted = await notificationsService.deleteNotification(id, userId);
      res.json({ success: true, data: { deleted } });
    } catch (err) {
      next(err);
    }
  },
};
