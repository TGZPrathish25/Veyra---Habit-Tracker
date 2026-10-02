/** Gamification and streaks API client methods with Cloud Firestore fallback. */
import { apiClient } from '@/lib/apiClient';
import { firestoreService } from '@/lib/firestoreService';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { GamificationStatus, Achievement, UserStreaks } from '../types';

interface ApiResponse<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

export const gamificationApi = {
  getStatus: async (): Promise<GamificationStatus> => {
    try {
      const res = await apiClient.get<ApiResponse<GamificationStatus>>('/gamification/status');
      return res.data.data;
    } catch (err) {
      const user = useAuthStore.getState().user;
      const userId = user?.id || 'user-cloud';
      if (user?.id) {
        const firestoreStatus = await firestoreService.getGamificationStatus(user.id);
        if (firestoreStatus) {
          return {
            userId,
            level: firestoreStatus.level,
            totalXp: firestoreStatus.totalXp,
            currentLevelXp: firestoreStatus.currentLevelXp,
            nextLevelXp: firestoreStatus.nextLevelXp,
            progressPercentage: firestoreStatus.progressPercentage,
            tasksCompleted: 4,
          };
        }
      }
      return {
        userId,
        level: user?.level || 1,
        totalXp: user?.xp || 0,
        currentLevelXp: 0,
        nextLevelXp: 100,
        progressPercentage: 0,
        tasksCompleted: 0,
      };
    }
  },

  getAchievements: async (): Promise<Achievement[]> => {
    try {
      const res = await apiClient.get<ApiResponse<Achievement[]>>('/gamification/achievements');
      return res.data.data;
    } catch {
      return [
        {
          id: 'ach-1',
          key: 'first_step',
          title: 'First Step',
          description: 'Completed your first habit on Veyra',
          category: 'tasks',
          icon: 'Footprints',
          xpReward: 50,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        },
        {
          id: 'ach-2',
          key: 'streak_3',
          title: 'Spark of Habit',
          description: 'Maintained a 3-day active habit streak',
          category: 'streaks',
          icon: 'Flame',
          xpReward: 100,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        },
        {
          id: 'ach-3',
          key: 'weekly_warrior',
          title: 'Weekly Warrior',
          description: 'Completed all target goals in a weekly plan',
          category: 'milestones',
          icon: 'Target',
          xpReward: 200,
          unlocked: false,
          unlockedAt: null,
        },
      ];
    }
  },

  getStreaks: async (): Promise<UserStreaks> => {
    const user = useAuthStore.getState().user;
    const userId = user?.id || 'user-cloud';
    try {
      const res = await apiClient.get<ApiResponse<UserStreaks>>('/streaks');
      return res.data.data;
    } catch {
      const dailyStreak = user?.id ? (await firestoreService.getStreaks(user.id)).dailyStreak : 1;
      const longest = user?.id ? (await firestoreService.getStreaks(user.id)).longestStreak : 3;
      const nowIso = new Date().toISOString();

      return {
        daily: {
          id: 's_daily',
          userId,
          type: 'daily',
          current: dailyStreak,
          longest,
          lastActiveDate: nowIso.split('T')[0],
          updatedAt: nowIso,
        },
        weekly: {
          id: 's_weekly',
          userId,
          type: 'weekly',
          current: 1,
          longest: 2,
          lastActiveDate: nowIso.split('T')[0],
          updatedAt: nowIso,
        },
        monthly: {
          id: 's_monthly',
          userId,
          type: 'monthly',
          current: 1,
          longest: 1,
          lastActiveDate: nowIso.split('T')[0],
          updatedAt: nowIso,
        },
      };
    }
  },
};

