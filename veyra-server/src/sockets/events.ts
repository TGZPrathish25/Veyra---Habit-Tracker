/** Socket.IO event name constants and payload types. */

export const SOCKET_EVENTS = {
  // Client → Server
  TASK_TOGGLE: 'task:toggle',
  CHALLENGE_UPDATE: 'challenge:update',

  // Server → Client
  XP_GAINED: 'xp:gained',
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  STREAK_UPDATED: 'streak:updated',
  FRIEND_PROGRESS: 'friend:progress',
  CHALLENGE_PROGRESS: 'challenge:progress',
  NOTIFICATION_NEW: 'notification:new',
} as const;

// Payload types
export interface TaskTogglePayload {
  taskId: string;
  date: string;
}

export interface XpGainedPayload {
  amount: number;
  total: number;
  level: number;
}

export interface AchievementUnlockedPayload {
  achievement: {
    key: string;
    title: string;
    icon: string;
  };
}

export interface StreakUpdatedPayload {
  type: 'daily' | 'weekly' | 'monthly';
  count: number;
}
