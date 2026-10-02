/** Notification feature client types. */

export type NotificationType =
  | 'friend_request'
  | 'challenge_invite'
  | 'achievement'
  | 'streak'
  | 'deadline_urgent'
  | 'system';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationsListResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}
