/** Module type definitions for auth. */

export interface UserProfileDTO {
  id: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  timezone: string;
  xp: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettingsDTO {
  theme: string;
  friendVisibilityLevel: number;
  leaderboardOptIn: boolean;
  deadlineAlertPrefs: unknown;
  notificationPrefs: unknown;
  challengePrefs: unknown;
  weekStartDay: number;
}

export interface AuthResponseDTO {
  user: UserProfileDTO;
  settings: UserSettingsDTO | null;
}
