/** Leaderboard API calls via apiClient with Cloud Firestore fallback. */
import { apiClient } from '@/lib/apiClient';
import { firestoreService } from '@/lib/firestoreService';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { LeaderboardEntry, LeaderboardSortMetric } from '../types';

interface ApiResponse<T> {
  status: string;
  data: T;
}

export const leaderboardApi = {
  getLeaderboard: async (sortBy: LeaderboardSortMetric = 'xp'): Promise<LeaderboardEntry[]> => {
    try {
      const res = await apiClient.get<ApiResponse<LeaderboardEntry[]>>(`/leaderboard?sortBy=${sortBy}`);
      if (res.data?.data && res.data.data.length > 0) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('API /leaderboard unavailable, falling back to registered profiles in Firestore:', err);
    }

    // Fallback: fetch registered community users directly from Firestore
    const currentUser = useAuthStore.getState().user;
    const entries: LeaderboardEntry[] = [];

    try {
      const firestoreUsers = await firestoreService.getAllCommunityUsers();
      for (const u of firestoreUsers) {
        if (!u.uid) continue;
        entries.push({
          id: u.uid,
          name: u.name || u.username || 'Adventurer',
          username: u.username || 'user',
          avatarUrl: u.avatarUrl || null,
          level: u.level || 1,
          totalXp: u.xp || 0,
          currentStreak: u.currentStreak || 0,
          longestStreak: u.longestStreak || 0,
          rank: 0,
        });
      }
    } catch {
      // Ignore
    }

    // If currentUser is authenticated and not in entries, include them
    if (currentUser?.id && !entries.some((e) => e.id === currentUser.id)) {
      entries.push({
        id: currentUser.id,
        name: currentUser.name || currentUser.username || 'You',
        username: currentUser.username || 'you',
        avatarUrl: currentUser.avatarUrl || null,
        level: currentUser.level || 1,
        totalXp: currentUser.xp || 0,
        currentStreak: 0,
        rank: 0,
        isMe: true,
      });
    }

    // Sort according to requested metric
    const sorted = [...entries].sort((a, b) => {
      if (sortBy === 'streak') {
        if (b.currentStreak !== a.currentStreak) {
          return b.currentStreak - a.currentStreak;
        }
        return b.totalXp - a.totalXp;
      }
      if (b.totalXp !== a.totalXp) {
        return b.totalXp - a.totalXp;
      }
      return b.currentStreak - a.currentStreak;
    });

    return sorted.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));
  },
};
