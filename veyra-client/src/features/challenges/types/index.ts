/** Challenges feature type definitions. */

export type ChallengeType = 'daily_streak' | 'task_count' | 'custom';

export interface Challenge {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description: string | null;
  type: ChallengeType;
  targetValue: number;
  rewardXp: number;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  createdAt: string;
  participantCount: number;
  isJoined?: boolean;
  userProgress?: number;
  isCompleted?: boolean;
}

export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  userLevel: number;
  progress: number;
  targetValue: number;
  progressPercentage: number;
  completed: boolean;
  joinedAt: string;
}

export interface CreateChallengePayload {
  title: string;
  description?: string;
  type: ChallengeType;
  targetValue: number;
  rewardXp?: number;
  startDate: string;
  endDate: string;
  isPublic?: boolean;
}

export interface UpdateChallengeProgressPayload {
  increment?: number;
  progress?: number;
}
