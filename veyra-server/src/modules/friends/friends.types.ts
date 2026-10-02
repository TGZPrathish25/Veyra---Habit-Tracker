/** Type definitions for friends, requests, privacy levels, and activity feeds. */

export type PrivacyLevel = 'basic' | 'counts' | 'detailed' | 'full';

export interface FriendUserDTO {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
  currentStreak: number;
}

export interface FriendshipDTO {
  id: string;
  userId: string;
  friendId: string;
  privacyLevel: PrivacyLevel;
  createdAt: string;
  friend: FriendUserDTO;
}

export interface FriendRequestDTO {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  sender: FriendUserDTO;
  receiver: FriendUserDTO;
}

export interface FriendProgressDTO {
  friendId: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  privacyLevel: PrivacyLevel;
  completionPercentage: number;
  // Included if privacyLevel >= 'counts'
  completedTasks?: number;
  totalTasks?: number;
  // Included if privacyLevel >= 'detailed'
  tasks?: Array<{
    id?: string;
    title: string;
    emoji: string | null;
    completed: boolean;
    completedAt?: string | null;
  }>;
  // Included if privacyLevel === 'full'
  currentStreak?: number;
  longestStreak?: number;
  level?: number;
  totalXp?: number;
}

export interface FriendActivityFeedDTO {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  userLevel: number;
  actionType: 'achievement' | 'streak' | 'completed_day' | 'joined_challenge';
  text: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface SendFriendRequestInput {
  targetUserId?: string;
  targetUsername?: string;
}

export interface RespondFriendRequestInput {
  action: 'accept' | 'reject';
}

export interface SetPrivacyLevelInput {
  privacyLevel: PrivacyLevel;
}
