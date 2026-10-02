/** User notifications management — unit tests. */
import { describe, it, expect } from 'vitest';
import { notificationsService } from './notifications.service.js';

describe('Notifications Module', () => {
  const userId = 'demo-user-id';

  it('lists notifications and computes unread count', async () => {
    const result = await notificationsService.getNotifications(userId);
    expect(result.notifications).toBeDefined();
    expect(Array.isArray(result.notifications)).toBe(true);
    expect(result.unreadCount).toBeGreaterThanOrEqual(0);
  });

  it('creates and sends a new notification', async () => {
    const notif = await notificationsService.sendNotification({
      userId,
      type: 'achievement',
      title: '🌟 Level Up!',
      body: 'You reached Level 5. Keep shining!',
      data: { level: 5 },
    });

    expect(notif.id).toBeDefined();
    expect(notif.userId).toBe(userId);
    expect(notif.read).toBe(false);
    expect(notif.title).toContain('Level Up');
  });

  it('marks a single notification as read', async () => {
    const list = await notificationsService.getNotifications(userId);
    const unread = list.notifications.find((n) => !n.read);

    if (unread) {
      const updated = await notificationsService.markAsRead(unread.id, userId);
      expect(updated.read).toBe(true);
    }
  });

  it('marks all unread notifications as read', async () => {
    const result = await notificationsService.markAllAsRead(userId);
    expect(result.count).toBeGreaterThanOrEqual(0);

    const after = await notificationsService.getNotifications(userId, true);
    expect(after.unreadCount).toBe(0);
  });

  it('deletes a notification', async () => {
    const notif = await notificationsService.sendNotification({
      userId,
      type: 'system',
      title: 'Temporary Notice',
      body: 'Will be deleted.',
    });

    const deleted = await notificationsService.deleteNotification(notif.id, userId);
    expect(deleted).toBe(true);
  });
});
