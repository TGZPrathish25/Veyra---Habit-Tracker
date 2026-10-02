/** Streaks domain types. */

export interface StreakDTO {
  id?: string;
  userId: string;
  type: 'daily' | 'weekly' | 'monthly';
  current: number;
  longest: number;
  lastActiveDate: string | null; // YYYY-MM-DD
}

export interface UserStreaksResponse {
  daily: StreakDTO;
  weekly: StreakDTO;
  monthly: StreakDTO;
}
