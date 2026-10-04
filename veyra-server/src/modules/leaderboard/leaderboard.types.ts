/** Leaderboard types — global and metric rankings across all registered users. */

export interface LeaderboardEntryDTO {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
}

export type LeaderboardSortMetric = 'xp' | 'streak';
