/** Leaderboard domain types. */

export interface LeaderboardEntry {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  level: number;
  totalXp: number;
  currentStreak: number;
  longestStreak?: number;
  rank: number;
  isMe?: boolean;
}

export type LeaderboardSortMetric = 'xp' | 'streak';
