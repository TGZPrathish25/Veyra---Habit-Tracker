/** Gamification, achievements, and streaks types. */

export interface GamificationStatus {
  userId: string;
  totalXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercentage: number;
  tasksCompleted: number;
}

export type AchievementCategory = 'streaks' | 'tasks' | 'milestones' | 'social';

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: AchievementCategory;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface StreakInfo {
  id: string;
  userId: string;
  type: 'daily' | 'weekly' | 'monthly';
  current: number;
  longest: number;
  lastActiveDate: string | null;
  updatedAt: string;
}

export interface UserStreaks {
  daily: StreakInfo;
  weekly: StreakInfo;
  monthly: StreakInfo;
}
