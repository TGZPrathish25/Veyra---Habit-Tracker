/** Gamification domain types: XP, levels, achievements. */

export interface GamificationDTO {
  userId: string;
  totalXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercentage: number;
  tasksCompleted: number;
}

export interface AchievementDTO {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: 'tasks' | 'streaks' | 'social' | 'milestones';
  unlocked: boolean;
  unlockedAt?: Date | null;
}

export interface AddXpResult {
  totalXp: number;
  level: number;
  previousLevel: number;
  leveledUp: boolean;
  unlockedAchievements: AchievementDTO[];
}
