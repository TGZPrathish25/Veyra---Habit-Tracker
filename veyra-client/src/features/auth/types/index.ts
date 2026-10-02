/** Auth feature types and models. */

export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  timezone: string;
  xp: number;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'ambient' | 'system';
  friendVisibilityLevel: number; // 1-4
  leaderboardOptIn: boolean;
  deadlineAlertPrefs?: Record<string, unknown>;
  notificationPrefs?: Record<string, unknown>;
  challengePrefs?: Record<string, unknown>;
  weekStartDay: number; // 1 = Monday
}

export interface AuthState {
  user: User | null;
  settings: UserSettings | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
