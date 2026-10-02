/** User notifications persistence with Prisma and in-memory development fallback. */
import { prisma, tryPrisma } from '../../db/prisma.js';
import type {
  NotificationDTO,
  CreateNotificationInput,
  NotificationType,
} from './notifications.types.js';

interface MemNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
}

// In-memory notifications storage
const memNotifications: MemNotification[] = [
  {
    id: 'notif-1',
    userId: 'demo-user-id',
    type: 'streak',
    title: '🔥 7-Day Streak Milestone!',
    body: 'Incredible consistency! You have logged habits for 7 consecutive days.',
    data: { streak: 7 },
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'demo-user-id',
    type: 'friend_request',
    title: '👋 Maya Chen sent you a friend request',
    body: 'Maya wants to connect and share habit accountability progress.',
    data: { senderId: 'demo-user-2', username: 'mayachen' },
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'demo-user-id',
    type: 'achievement',
    title: '🏆 Achievement Unlocked: First Step!',
    body: 'You completed your first daily habit and earned +50 XP bonus.',
    data: { achievementKey: 'FIRST_STEP', xp: 50 },
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'notif-4',
    userId: 'demo-user-id',
    type: 'challenge_invite',
    title: '🎯 Invited to 30-Day Morning Sprint',
    body: 'Alex Rivera invited you to join the October consistency challenge.',
    data: { challengeId: 'chal-1' },
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export const notificationsRepository = {
  async findUserNotifications(
    userId: string,
    unreadOnly = false,
    limit = 30
  ): Promise<NotificationDTO[]> {
    return tryPrisma(
      async () => {
        const where: Record<string, unknown> = { userId };
        if (unreadOnly) where.read = false;

        const notifs = await prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
        });

        return notifs.map((n) => ({
          id: n.id,
          userId: n.userId,
          type: n.type as NotificationType,
          title: n.title,
          body: n.body,
          data: (n.data as Record<string, unknown>) ?? null,
          read: n.read,
          createdAt: n.createdAt.toISOString(),
        }));
      },
      async () => {
        return memNotifications
          .filter((n) => n.userId === userId && (!unreadOnly || !n.read))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit)
          .map((n) => ({
            id: n.id,
            userId: n.userId,
            type: n.type,
            title: n.title,
            body: n.body,
            data: n.data,
            read: n.read,
            createdAt: n.createdAt,
          }));
      }
    );
  },

  async countUnread(userId: string): Promise<number> {
    return tryPrisma(
      async () => {
        return prisma.notification.count({
          where: { userId, read: false },
        });
      },
      async () => {
        return memNotifications.filter((n) => n.userId === userId && !n.read).length;
      }
    );
  },

  async markAsRead(id: string, userId: string): Promise<NotificationDTO | null> {
    return tryPrisma(
      async () => {
        const updated = await prisma.notification.update({
          where: { id, userId },
          data: { read: true },
        });
        return {
          id: updated.id,
          userId: updated.userId,
          type: updated.type as NotificationType,
          title: updated.title,
          body: updated.body,
          data: (updated.data as Record<string, unknown>) ?? null,
          read: updated.read,
          createdAt: updated.createdAt.toISOString(),
        };
      },
      async () => {
        const notif = memNotifications.find((n) => n.id === id && n.userId === userId);
        if (!notif) return null;
        notif.read = true;
        return { ...notif };
      }
    );
  },

  async markAllAsRead(userId: string): Promise<number> {
    return tryPrisma(
      async () => {
        const result = await prisma.notification.updateMany({
          where: { userId, read: false },
          data: { read: true },
        });
        return result.count;
      },
      async () => {
        let count = 0;
        memNotifications.forEach((n) => {
          if (n.userId === userId && !n.read) {
            n.read = true;
            count++;
          }
        });
        return count;
      }
    );
  },

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    return tryPrisma(
      async () => {
        await prisma.notification.delete({
          where: { id, userId },
        });
        return true;
      },
      async () => {
        const idx = memNotifications.findIndex((n) => n.id === id && n.userId === userId);
        if (idx === -1) return false;
        memNotifications.splice(idx, 1);
        return true;
      }
    );
  },

  async createNotification(input: CreateNotificationInput): Promise<NotificationDTO> {
    return tryPrisma(
      async () => {
        const created = await prisma.notification.create({
          data: {
            userId: input.userId,
            type: input.type,
            title: input.title,
            body: input.body,
            data: input.data ? JSON.stringify(input.data) : undefined,
            read: false,
          },
        });
        return {
          id: created.id,
          userId: created.userId,
          type: created.type as NotificationType,
          title: created.title,
          body: created.body,
          data: (created.data as Record<string, unknown>) ?? null,
          read: created.read,
          createdAt: created.createdAt.toISOString(),
        };
      },
      async () => {
        const newNotif: MemNotification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          userId: input.userId,
          type: input.type,
          title: input.title,
          body: input.body,
          data: input.data ?? null,
          read: false,
          createdAt: new Date().toISOString(),
        };
        memNotifications.unshift(newNotif);
        return { ...newNotif };
      }
    );
  },
};
