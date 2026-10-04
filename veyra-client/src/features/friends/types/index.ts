/** Client types for friends, requests, privacy levels, and activity feeds. */

export type PrivacyLevel = 'basic' | 'counts' | 'detailed' | 'full';

export interface FriendUser {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
  currentStreak: number;
}

export interface DiscoverUser extends FriendUser {
  friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'friends';
  requestId?: string;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  privacyLevel: PrivacyLevel;
  createdAt: string;
  friend: FriendUser;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  sender: FriendUser;
  receiver: FriendUser;
}

export interface FriendProgress {
  friendId: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  privacyLevel: PrivacyLevel;
  completionPercentage: number;
  completedTasks?: number;
  totalTasks?: number;
  tasks?: Array<{
    id?: string;
    title: string;
    description?: string | null;
    emoji: string | null;
    completed: boolean;
    completedAt?: string | null;
  }>;
  currentStreak?: number;
  longestStreak?: number;
  level?: number;
  totalXp?: number;
}

export interface FriendActivityFeedItem {
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

export interface SendFriendRequestPayload {
  targetUserId?: string;
  targetUsername?: string;
}
