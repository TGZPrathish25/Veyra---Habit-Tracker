import { prisma, tryPrisma } from '../../db/prisma.js';
import { persistentStore, type StoredUser, type StoredSettings } from '../../db/persistentStore.js';
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

function toUserRecord(u: StoredUser, settings?: StoredSettings | null): UserRecord {
  return {
    id: u.id,
    firebaseUid: u.firebaseUid,
    email: u.email,
    name: u.name,
    username: u.username,
    avatarUrl: u.avatarUrl,
    timezone: u.timezone,
    xp: u.xp,
    level: u.level,
    createdAt: new Date(u.createdAt),
    updatedAt: new Date(u.updatedAt),
    settings: settings || null,
  };
}

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
      async () => {
        const u = await persistentStore.getUserById(id);
        if (!u) return null;
        const s = await persistentStore.getSettings(id);
        return toUserRecord(u, s);
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
      async () => {
        const u = await persistentStore.getUserByFirebaseUid(firebaseUid);
        if (!u) return null;
        const s = await persistentStore.getSettings(u.id);
        return toUserRecord(u, s);
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
      async () => {
        const u = await persistentStore.getUserByUsername(normalized);
        if (!u) return null;
        const s = await persistentStore.getSettings(u.id);
        return toUserRecord(u, s);
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
            timezone: data.timezone || 'Asia/Kolkata',
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
      async () => {
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
        const nowIso = new Date().toISOString();
        const storedUser: StoredUser = {
          id,
          firebaseUid: data.firebaseUid,
          email: data.email,
          name: data.name || null,
          username: data.username.toLowerCase(),
          avatarUrl: data.avatarUrl || null,
          timezone: data.timezone || 'Asia/Kolkata',
          xp: 0,
          level: 1,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        await persistentStore.saveUser(storedUser);
        await persistentStore.saveSettings(id, settings);
        return toUserRecord(storedUser, settings);
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
      async () => {
        const existing = await persistentStore.getUserById(id);
        if (!existing) throw new Error('User not found');
        const updated: StoredUser = {
          ...existing,
          name: data.name !== undefined ? data.name : existing.name,
          username: data.username !== undefined ? data.username.toLowerCase() : existing.username,
          avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : existing.avatarUrl,
          timezone: data.timezone !== undefined ? data.timezone : existing.timezone,
          updatedAt: new Date().toISOString(),
        };
        await persistentStore.saveUser(updated);
        const settings = await persistentStore.getSettings(id);
        return toUserRecord(updated, settings);
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
      async () => {
        let s = await persistentStore.getSettings(userId);
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
          await persistentStore.saveSettings(userId, s);
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
      async () => {
        const current = (await persistentStore.getSettings(userId)) || {
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
        await persistentStore.saveSettings(userId, updated);
        return updated;
      }
    );
  }
}

export const usersRepository = new UsersRepository();
