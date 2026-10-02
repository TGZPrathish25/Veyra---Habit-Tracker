/** Notifications API client. */
import { apiClient } from '@/lib/apiClient';
import type { NotificationsListResponse, NotificationItem } from '../types';

export const notificationsApi = {
  async getNotifications(unreadOnly = false, limit = 30): Promise<NotificationsListResponse> {
    const res = await apiClient.get<{ data: NotificationsListResponse }>(
      `/notifications?unreadOnly=${unreadOnly}&limit=${limit}`
    );
    return res.data.data;
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    const res = await apiClient.patch<{ data: NotificationItem }>(`/notifications/${id}/read`);
    return res.data.data;
  },

  async markAllAsRead(): Promise<{ count: number }> {
    const res = await apiClient.post<{ data: { count: number } }>('/notifications/mark-all-read');
    return res.data.data;
  },

  async deleteNotification(id: string): Promise<boolean> {
    const res = await apiClient.delete<{ data: { deleted: boolean } }>(`/notifications/${id}`);
    return res.data.data.deleted;
  },
};
