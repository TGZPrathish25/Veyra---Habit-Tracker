/** Gamification & achievements persistence via Prisma with in-memory development fallback. */
import { prisma, tryPrisma } from '../../db/prisma.js';
import type { GamificationDTO, AchievementDTO } from './gamification.types.js';

interface MemGamification {
  userId: string;
  totalXp: number;
  level: number;
  tasksCompleted: number;
}

const memGamification = new Map<string, MemGamification>();
const memUserAchievements = new Map<string, Set<string>>(); // userId -> Set of achievementKeys

// 12 Standard achievements catalog
export const DEFAULT_ACHIEVEMENTS: Omit<AchievementDTO, 'id' | 'unlocked' | 'unlockedAt'>[] = [
  { key: 'first_step', title: 'First Step', description: 'Complete your first habit', icon: '🎯', xpReward: 50, category: 'tasks' },
  { key: 'streak_3', title: '3-Day Momentum', description: 'Maintain a 3-day daily streak', icon: '🌱', xpReward: 50, category: 'streaks' },
  { key: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', xpReward: 100, category: 'streaks' },
  { key: 'streak_14', title: 'Fortnight Focus', description: 'Maintain a 14-day streak', icon: '⚡', xpReward: 200, category: 'streaks' },
  { key: 'streak_30', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '👑', xpReward: 500, category: 'streaks' },
  { key: 'tasks_25', title: 'Habit Builder', description: 'Complete 25 total habits', icon: '🥉', xpReward: 100, category: 'tasks' },
  { key: 'tasks_50', title: 'Half-Century', description: 'Complete 50 total habits', icon: '🥈', xpReward: 150, category: 'tasks' },
  { key: 'tasks_100', title: 'Century Club', description: 'Complete 100 total habits', icon: '🥇', xpReward: 300, category: 'milestones' },
  { key: 'perfect_day', title: 'Flawless Day', description: 'Check off all habits in a single day', icon: '⭐', xpReward: 75, category: 'tasks' },
  { key: 'weekend_warrior', title: 'Weekend Champion', description: 'Complete habits on Saturday and Sunday', icon: '🛡️', xpReward: 100, category: 'streaks' },
  { key: 'social_butterfly', title: 'Social Butterfly', description: 'Connect with 3 friends', icon: '🦋', xpReward: 100, category: 'social' },
  { key: 'challenger', title: 'Challenger', description: 'Complete your first challenge milestone', icon: '🏆', xpReward: 150, category: 'social' },
];

export class GamificationRepository {
  async getGamification(userId: string): Promise<MemGamification> {
    return tryPrisma(
      async () => {
        let g = await prisma.gamification.findUnique({
          where: { userId },
        });
        if (!g) {
          g = await prisma.gamification.create({
            data: { userId, totalXp: 0, level: 1, tasksCompleted: 0 },
          });
        }
        return {
          userId: g.userId,
          totalXp: g.totalXp,
          level: g.level,
          tasksCompleted: g.tasksCompleted,
        };
      },
      () => {
        let g = memGamification.get(userId);
        if (!g) {
          g = { userId, totalXp: 0, level: 1, tasksCompleted: 0 };
          memGamification.set(userId, g);
        }
        return g;
      }
    );
  }

  async updateGamification(
    userId: string,
    data: { totalXp?: number; level?: number; tasksCompleted?: number }
  ): Promise<MemGamification> {
    return tryPrisma(
      async () => {
        const updated = await prisma.gamification.upsert({
          where: { userId },
          create: {
            userId,
            totalXp: data.totalXp ?? 0,
            level: data.level ?? 1,
            tasksCompleted: data.tasksCompleted ?? 0,
          },
          update: data,
        });
        // Also sync User table level & xp
        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: updated.totalXp,
            level: updated.level,
          },
        }).catch(() => {});

        return {
          userId: updated.userId,
          totalXp: updated.totalXp,
          level: updated.level,
          tasksCompleted: updated.tasksCompleted,
        };
      },
      () => {
        const current = memGamification.get(userId) || { userId, totalXp: 0, level: 1, tasksCompleted: 0 };
        const updated: MemGamification = {
          userId,
          totalXp: data.totalXp !== undefined ? data.totalXp : current.totalXp,
          level: data.level !== undefined ? data.level : current.level,
          tasksCompleted: data.tasksCompleted !== undefined ? data.tasksCompleted : current.tasksCompleted,
        };
        memGamification.set(userId, updated);
        return updated;
      }
    );
  }

  async getAchievementsCatalog(userId: string): Promise<AchievementDTO[]> {
    return tryPrisma(
      async () => {
        // Ensure catalog exists in db
        const allAchievements = await prisma.achievement.findMany();
        if (allAchievements.length === 0) {
          for (const item of DEFAULT_ACHIEVEMENTS) {
            await prisma.achievement.upsert({
              where: { key: item.key },
              create: item,
              update: {},
            });
          }
        }

        const userUnlocks = await prisma.userAchievement.findMany({
          where: { userId },
          include: { achievement: true },
        });

        const unlockedMap = new Map(userUnlocks.map((u) => [u.achievement.key, u.unlockedAt]));
        const freshList = await prisma.achievement.findMany();

        return freshList.map((a) => ({
          id: a.id,
          key: a.key,
          title: a.title,
          description: a.description,
          icon: a.icon,
          xpReward: a.xpReward,
          category: a.category as AchievementDTO['category'],
          unlocked: unlockedMap.has(a.key),
          unlockedAt: unlockedMap.get(a.key) || null,
        }));
      },
      () => {
        const unlockedSet = memUserAchievements.get(userId) || new Set<string>();
        return DEFAULT_ACHIEVEMENTS.map((a, idx) => ({
          id: `ach_${idx}_${a.key}`,
          key: a.key,
          title: a.title,
          description: a.description,
          icon: a.icon,
          xpReward: a.xpReward,
          category: a.category as AchievementDTO['category'],
          unlocked: unlockedSet.has(a.key),
          unlockedAt: unlockedSet.has(a.key) ? new Date() : null,
        }));
      }
    );
  }

  async unlockAchievement(userId: string, achievementKey: string): Promise<boolean> {
    return tryPrisma(
      async () => {
        const ach = await prisma.achievement.findUnique({
          where: { key: achievementKey },
        });
        if (!ach) return false;

        const existing = await prisma.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: ach.id,
            },
          },
        });
        if (existing) return false; // Already unlocked

        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: ach.id,
          },
        });
        return true;
      },
      () => {
        let set = memUserAchievements.get(userId);
        if (!set) {
          set = new Set<string>();
          memUserAchievements.set(userId, set);
        }
        if (set.has(achievementKey)) return false;
        set.add(achievementKey);
        return true;
      }
    );
  }
}

export const gamificationRepository = new GamificationRepository();
