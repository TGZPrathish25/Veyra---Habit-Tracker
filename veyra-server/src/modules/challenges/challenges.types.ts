/** Challenges module type definitions. */

export type ChallengeType = 'daily_streak' | 'task_count' | 'custom';

export interface ChallengeDTO {
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

export interface ChallengeParticipantDTO {
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

export interface CreateChallengeInput {
  title: string;
  description?: string;
  type: ChallengeType;
  targetValue: number;
  rewardXp?: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  isPublic?: boolean;
}

export interface UpdateChallengeProgressInput {
  increment?: number;
  progress?: number;
}
