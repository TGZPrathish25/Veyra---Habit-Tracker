/** Leaderboard API calls via apiClient with Cloud Firestore fallback & strict deduplication. */
import { apiClient } from '@/lib/apiClient';
import { firestoreService } from '@/lib/firestoreService';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { LeaderboardEntry, LeaderboardSortMetric } from '../types';

interface ApiResponse<T> {
  status: string;
  data: T;
}

function isDummy(u: { id?: string; username?: string | null; name?: string | null }): boolean {
  if (!u) return true;
  if (u.id === 'usr_demo' || u.id === 'demo' || u.id === 'mock') return true;
  if (u.username?.toLowerCase() === 'demo' || u.username?.toLowerCase() === 'friend') return true;
  if (u.name === 'Demo User' || u.name === 'Friend') return true;
  return false;
}

export const leaderboardApi = {
  getLeaderboard: async (sortBy: LeaderboardSortMetric = 'xp'): Promise<LeaderboardEntry[]> => {
    let rawList: LeaderboardEntry[] = [];

    try {
      const res = await apiClient.get<ApiResponse<LeaderboardEntry[]>>(`/leaderboard?sortBy=${sortBy}`);
      if (res.data?.data && res.data.data.length > 0) {
        rawList = res.data.data;
      }
    } catch (err) {
      console.warn('API /leaderboard unavailable, falling back to registered profiles in Firestore:', err);
    }

    // Fallback: fetch registered community users directly from Firestore
    if (rawList.length === 0) {
      try {
        const firestoreUsers = await firestoreService.getAllCommunityUsers();
        for (const u of firestoreUsers) {
          if (!u.uid || isDummy(u)) continue;
          rawList.push({
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
    }

    const currentUser = useAuthStore.getState().user;
    const currentUserId = currentUser?.id;
    const currentFirebaseUid = currentUser?.firebaseUid;
    const currentUsername = currentUser?.username?.toLowerCase();

    const isCurrent = (e: { id: string; username?: string | null }) => {
      if (!currentUser) return false;
      if (currentUserId && e.id === currentUserId) return true;
      if (currentFirebaseUid && e.id === currentFirebaseUid) return true;
      if (currentUsername && e.username && e.username.toLowerCase() === currentUsername) return true;
      return false;
    };

    // Strict deduplication by ID and normalized username
    const seenIds = new Set<string>();
    const seenUsernames = new Set<string>();
    const deduplicated: LeaderboardEntry[] = [];

    for (const item of rawList) {
      if (isDummy(item)) continue;

      const normUser = item.username?.toLowerCase().trim();
      if (seenIds.has(item.id)) continue;
      if (normUser && seenUsernames.has(normUser)) continue;

      seenIds.add(item.id);
      if (normUser) seenUsernames.add(normUser);

      deduplicated.push(item);
    }

    // Include authenticated user only if completely absent from standings
    const userFound = deduplicated.some(isCurrent);
    if (!userFound && currentUser) {
      deduplicated.push({
        id: currentUser.id || 'me',
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
    const sorted = deduplicated.sort((a, b) => {
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
      isMe: isCurrent(entry),
    }));
  },
};
