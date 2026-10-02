/** React Query hooks for gamification status, streaks, and achievements. */
import { useQuery } from '@tanstack/react-query';
import { gamificationApi } from '../api/gamificationApi';
import type { GamificationStatus, Achievement, UserStreaks, AchievementCategory } from '../types';

export function useGamification() {
  const {
    data: status,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<GamificationStatus>({
    queryKey: ['gamification-status'],
    queryFn: gamificationApi.getStatus,
    staleTime: 1000 * 30, // 30 seconds
  });

  return {
    status,
    level: status?.level ?? 1,
    totalXp: status?.totalXp ?? 0,
    currentLevelXp: status?.currentLevelXp ?? 0,
    nextLevelXp: status?.nextLevelXp ?? 200,
    progressPercentage: status?.progressPercentage ?? 0,
    tasksCompleted: status?.tasksCompleted ?? 0,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useStreaks() {
  const {
    data: streaks,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<UserStreaks>({
    queryKey: ['streaks'],
    queryFn: gamificationApi.getStreaks,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    streaks,
    dailyStreak: streaks?.daily?.current ?? 0,
    longestStreak: streaks?.daily?.longest ?? 0,
    weeklyStreak: streaks?.weekly?.current ?? 0,
    monthlyStreak: streaks?.monthly?.current ?? 0,
    lastActiveDate: streaks?.daily?.lastActiveDate ?? null,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useAchievements(filterCategory?: AchievementCategory | 'all') {
  const {
    data: achievements = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Achievement[]>({
    queryKey: ['gamification-achievements'],
    queryFn: gamificationApi.getAchievements,
    staleTime: 1000 * 60, // 1 minute
  });

  const filteredAchievements =
    !filterCategory || filterCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === filterCategory);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const unlockedXp = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);

  return {
    achievements: filteredAchievements,
    allAchievements: achievements,
    unlockedCount,
    totalCount,
    completionPercentage,
    unlockedXp,
    isLoading,
    isError,
    error,
    refetch,
  };
}
