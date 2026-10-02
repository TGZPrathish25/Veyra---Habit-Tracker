/** Gamification & achievements business logic with RPG progression curve. */
import { gamificationRepository, DEFAULT_ACHIEVEMENTS } from './gamification.repository.js';
import type { GamificationDTO, AchievementDTO, AddXpResult } from './gamification.types.js';

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 100 * level * (level - 1);
}

export function calculateLevelFromXp(xp: number): number {
  if (xp <= 0) return 1;
  const level = Math.floor((1 + Math.sqrt(1 + (4 * xp) / 100)) / 2);
  return Math.max(1, level);
}

export function getLevelProgress(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercentage: number;
} {
  const level = calculateLevelFromXp(xp);
  const floor = xpForLevel(level);
  const ceiling = xpForLevel(level + 1);
  const diff = ceiling - floor;
  const progressPercentage = diff > 0 ? Math.min(100, Math.floor(((xp - floor) / diff) * 100)) : 100;

  return {
    level,
    currentLevelXp: xp - floor,
    nextLevelXp: ceiling - floor,
    progressPercentage,
  };
}

export interface AchievementTriggerContext {
  tasksCompleted?: number;
  currentStreak?: number;
  allHabitsCompletedToday?: boolean;
  friendsCount?: number;
}

export class GamificationService {
  async getStatus(userId: string): Promise<GamificationDTO> {
    const record = await gamificationRepository.getGamification(userId);
    const progress = getLevelProgress(record.totalXp);

    return {
      userId,
      totalXp: record.totalXp,
      level: progress.level,
      currentLevelXp: progress.currentLevelXp,
      nextLevelXp: progress.nextLevelXp,
      progressPercentage: progress.progressPercentage,
      tasksCompleted: record.tasksCompleted,
    };
  }

  async addXp(userId: string, xpDelta: number, taskIncrement = 0): Promise<AddXpResult> {
    const current = await gamificationRepository.getGamification(userId);
    const newTotalXp = Math.max(0, current.totalXp + xpDelta);
    const newTasksCompleted = current.tasksCompleted + taskIncrement;
    const previousLevel = current.level;
    const newLevel = calculateLevelFromXp(newTotalXp);
    const leveledUp = newLevel > previousLevel;

    await gamificationRepository.updateGamification(userId, {
      totalXp: newTotalXp,
      level: newLevel,
      tasksCompleted: newTasksCompleted,
    });

    return {
      totalXp: newTotalXp,
      level: newLevel,
      previousLevel,
      leveledUp,
      unlockedAchievements: [],
    };
  }

  async getAchievements(userId: string): Promise<AchievementDTO[]> {
    return gamificationRepository.getAchievementsCatalog(userId);
  }

  async evaluateAchievements(
    userId: string,
    context: AchievementTriggerContext
  ): Promise<AchievementDTO[]> {
    const gamification = await gamificationRepository.getGamification(userId);
    const tasksCompleted = context.tasksCompleted ?? gamification.tasksCompleted;
    const streak = context.currentStreak ?? 0;

    const toUnlock: string[] = [];

    if (tasksCompleted >= 1) toUnlock.push('first_step');
    if (tasksCompleted >= 25) toUnlock.push('tasks_25');
    if (tasksCompleted >= 50) toUnlock.push('tasks_50');
    if (tasksCompleted >= 100) toUnlock.push('tasks_100');

    if (streak >= 3) toUnlock.push('streak_3');
    if (streak >= 7) toUnlock.push('streak_7');
    if (streak >= 14) toUnlock.push('streak_14');
    if (streak >= 30) toUnlock.push('streak_30');

    if (context.allHabitsCompletedToday) toUnlock.push('perfect_day');
    if ((context.friendsCount ?? 0) >= 3) toUnlock.push('social_butterfly');

    const newlyUnlocked: AchievementDTO[] = [];

    for (const key of toUnlock) {
      const unlockedNow = await gamificationRepository.unlockAchievement(userId, key);
      if (unlockedNow) {
        const achDef = DEFAULT_ACHIEVEMENTS.find((a) => a.key === key);
        if (achDef) {
          // Award XP bonus for unlocking achievement
          await this.addXp(userId, achDef.xpReward, 0);
          newlyUnlocked.push({
            id: `ach_${key}`,
            ...achDef,
            unlocked: true,
            unlockedAt: new Date(),
          });
        }
      }
    }

    return newlyUnlocked;
  }
}

export const gamificationService = new GamificationService();
