/** User notifications management — business logic & real-time dispatch. */
import { notificationsRepository } from './notifications.repository.js';
import type {
  NotificationDTO,
  NotificationsListResponse,
  CreateNotificationInput,
} from './notifications.types.js';

export const notificationsService = {
  async getNotifications(
    userId: string,
    unreadOnly = false,
    limit = 30
  ): Promise<NotificationsListResponse> {
    const [notifications, unreadCount] = await Promise.all([
      notificationsRepository.findUserNotifications(userId, unreadOnly, limit),
      notificationsRepository.countUnread(userId),
    ]);

    return {
      notifications,
      unreadCount,
    };
  },

  async markAsRead(id: string, userId: string): Promise<NotificationDTO> {
    const updated = await notificationsRepository.markAsRead(id, userId);
    if (!updated) {
      throw new Error('Notification not found or access denied');
    }
    return updated;
  },

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const count = await notificationsRepository.markAllAsRead(userId);
    return { count };
  },

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    return notificationsRepository.deleteNotification(id, userId);
  },

  async sendNotification(input: CreateNotificationInput): Promise<NotificationDTO> {
    return notificationsRepository.createNotification(input);
  },
};
