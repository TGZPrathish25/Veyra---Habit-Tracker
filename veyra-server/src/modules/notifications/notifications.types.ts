/** Notification domain types. */

export type NotificationType =
  | 'friend_request'
  | 'challenge_invite'
  | 'achievement'
  | 'streak'
  | 'deadline_urgent'
  | 'system';

export interface NotificationDTO {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
}

export interface NotificationsListResponse {
  notifications: NotificationDTO[];
  unreadCount: number;
}
