import { prisma, tryPrisma } from '../../db/prisma.js';
import type { Prisma } from '@prisma/client';

export interface UserRecord {
  id: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  timezone: string;
  xp: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
  settings?: SettingsRecord | null;
}

export interface SettingsRecord {
  theme: string;
  friendVisibilityLevel: number;
  leaderboardOptIn: boolean;
  deadlineAlertPrefs: unknown;
  notificationPrefs: unknown;
  challengePrefs: unknown;
  weekStartDay: number;
}

// In-memory fallback store for local development when PostgreSQL is not running
const memUsers = new Map<string, UserRecord>();
const memSettings = new Map<string, SettingsRecord>();

// Pre-seed demo user in memory
const demoSettings: SettingsRecord = {
  theme: 'dark',
  friendVisibilityLevel: 2,
  leaderboardOptIn: true,
  deadlineAlertPrefs: null,
  notificationPrefs: null,
  challengePrefs: null,
  weekStartDay: 1,
};

const demoUser: UserRecord = {
  id: 'usr_demo',
  firebaseUid: 'demo',
  email: 'demo@veyra.app',
  name: 'Demo User',
  username: 'demo',
  avatarUrl: null,
  timezone: 'America/New_York',
  xp: 1250,
  level: 5,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date(),
  settings: demoSettings,
};

memUsers.set(demoUser.id, demoUser);
memSettings.set(demoUser.id, demoSettings);



export class UsersRepository {
  async findById(id: string): Promise<UserRecord | null> {
    return tryPrisma(
      async () => {
        const u = await prisma.user.findUnique({
          where: { id },
          include: { settings: true },
        });
        return u as UserRecord | null;
      },
      () => {
        const u = memUsers.get(id);
        if (!u) return null;
        return { ...u, settings: memSettings.get(id) || null };
      }
    );
  }

  async findByFirebaseUid(firebaseUid: string): Promise<UserRecord | null> {
    return tryPrisma(
      async () => {
        const u = await prisma.user.findUnique({
          where: { firebaseUid },
          include: { settings: true },
        });
        return u as UserRecord | null;
      },
      () => {
        for (const u of memUsers.values()) {
          if (u.firebaseUid === firebaseUid) {
            return { ...u, settings: memSettings.get(u.id) || null };
          }
        }
        return null;
      }
    );
  }

  async findByUsername(username: string): Promise<UserRecord | null> {
    const normalized = username.toLowerCase();
    return tryPrisma(
      async () => {
        const u = await prisma.user.findUnique({
          where: { username: normalized },
          include: { settings: true },
        });
        return u as UserRecord | null;
      },
      () => {
        for (const u of memUsers.values()) {
          if (u.username?.toLowerCase() === normalized) {
            return { ...u, settings: memSettings.get(u.id) || null };
          }
        }
        return null;
      }
    );
  }

  async createUser(data: {
    firebaseUid: string;
    email: string;
    name?: string | null;
    username: string;
    avatarUrl?: string | null;
    timezone?: string;
  }): Promise<UserRecord> {
    return tryPrisma(
      async () => {
        const u = await prisma.user.create({
          data: {
            firebaseUid: data.firebaseUid,
            email: data.email,
            name: data.name || null,
            username: data.username.toLowerCase(),
            avatarUrl: data.avatarUrl || null,
            timezone: data.timezone || 'UTC',
            settings: {
              create: {
                theme: 'dark',
                friendVisibilityLevel: 2,
                leaderboardOptIn: true,
                weekStartDay: 1,
              },
            },
            gamification: {
              create: {
                totalXp: 0,
                level: 1,
                tasksCompleted: 0,
              },
            },
          },
          include: { settings: true },
        });
        return u as UserRecord;
      },
      () => {
        const id = 'usr_' + Math.random().toString(36).substring(2, 11);
        const settings: SettingsRecord = {
          theme: 'dark',
          friendVisibilityLevel: 2,
          leaderboardOptIn: true,
          deadlineAlertPrefs: null,
          notificationPrefs: null,
          challengePrefs: null,
          weekStartDay: 1,
        };
        const user: UserRecord = {
          id,
          firebaseUid: data.firebaseUid,
          email: data.email,
          name: data.name || null,
          username: data.username.toLowerCase(),
          avatarUrl: data.avatarUrl || null,
          timezone: data.timezone || 'UTC',
          xp: 0,
          level: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          settings,
        };
        memUsers.set(id, user);
        memSettings.set(id, settings);
        return user;
      }
    );
  }

  async updateUser(
    id: string,
    data: {
      name?: string;
      username?: string;
      avatarUrl?: string | null;
      timezone?: string;
    }
  ): Promise<UserRecord> {
    return tryPrisma(
      async () => {
        const u = await prisma.user.update({
          where: { id },
          data: {
            ...data,
            username: data.username ? data.username.toLowerCase() : undefined,
          },
          include: { settings: true },
        });
        return u as UserRecord;
      },
      () => {
        const existing = memUsers.get(id);
        if (!existing) throw new Error('User not found in memory');
        const updated: UserRecord = {
          ...existing,
          name: data.name !== undefined ? data.name : existing.name,
          username: data.username !== undefined ? data.username.toLowerCase() : existing.username,
          avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : existing.avatarUrl,
          timezone: data.timezone !== undefined ? data.timezone : existing.timezone,
          updatedAt: new Date(),
        };
        memUsers.set(id, updated);
        return { ...updated, settings: memSettings.get(id) || null };
      }
    );
  }

  async getSettings(userId: string): Promise<SettingsRecord> {
    return tryPrisma(
      async () => {
        const s = await prisma.userSettings.findUnique({
          where: { userId },
        });
        if (!s) {
          return this.updateSettings(userId, {
            theme: 'dark',
            friendVisibilityLevel: 2,
            leaderboardOptIn: true,
            weekStartDay: 1,
          });
        }
        return s as unknown as SettingsRecord;
      },
      () => {
        let s = memSettings.get(userId);
        if (!s) {
          s = {
            theme: 'dark',
            friendVisibilityLevel: 2,
            leaderboardOptIn: true,
            deadlineAlertPrefs: null,
            notificationPrefs: null,
            challengePrefs: null,
            weekStartDay: 1,
          };
          memSettings.set(userId, s);
        }
        return s;
      }
    );
  }

  async updateSettings(
    userId: string,
    data: {
      theme?: string;
      friendVisibilityLevel?: number;
      leaderboardOptIn?: boolean;
      deadlineAlertPrefs?: Prisma.InputJsonValue;
      notificationPrefs?: Prisma.InputJsonValue;
      challengePrefs?: Prisma.InputJsonValue;
      weekStartDay?: number;
    }
  ): Promise<SettingsRecord> {
    return tryPrisma(
      async () => {
        const s = await prisma.userSettings.upsert({
          where: { userId },
          update: data,
          create: {
            userId,
            theme: data.theme || 'dark',
            friendVisibilityLevel: data.friendVisibilityLevel ?? 2,
            leaderboardOptIn: data.leaderboardOptIn ?? true,
            weekStartDay: data.weekStartDay ?? 1,
          },
        });
        return s as unknown as SettingsRecord;
      },
      () => {
        const current = memSettings.get(userId) || {
          theme: 'dark',
          friendVisibilityLevel: 2,
          leaderboardOptIn: true,
          deadlineAlertPrefs: null,
          notificationPrefs: null,
          challengePrefs: null,
          weekStartDay: 1,
        };
        const updated: SettingsRecord = {
          theme: data.theme ?? current.theme,
          friendVisibilityLevel: data.friendVisibilityLevel ?? current.friendVisibilityLevel,
          leaderboardOptIn: data.leaderboardOptIn ?? current.leaderboardOptIn,
          deadlineAlertPrefs: data.deadlineAlertPrefs !== undefined ? data.deadlineAlertPrefs : current.deadlineAlertPrefs,
          notificationPrefs: data.notificationPrefs !== undefined ? data.notificationPrefs : current.notificationPrefs,
          challengePrefs: data.challengePrefs !== undefined ? data.challengePrefs : current.challengePrefs,
          weekStartDay: data.weekStartDay ?? current.weekStartDay,
        };
        memSettings.set(userId, updated);
        return updated;
      }
    );
  }
}

export const usersRepository = new UsersRepository();
