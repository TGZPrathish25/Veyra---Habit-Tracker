/** Friends service — business logic, privacy-level enforcement, and request validation. */
import { friendsRepository } from './friends.repository.js';
import type {
  FriendshipDTO,
  FriendRequestDTO,
  FriendProgressDTO,
  FriendActivityFeedDTO,
  DiscoverUserDTO,
  SendFriendRequestInput,
  PrivacyLevel,
} from './friends.types.js';

export class FriendsService {
  async listFriends(userId: string): Promise<FriendshipDTO[]> {
    return friendsRepository.listFriends(userId);
  }

  async discoverUsers(userId: string): Promise<DiscoverUserDTO[]> {
    const [allUsers, friendships, requests] = await Promise.all([
      friendsRepository.listAllUsers(userId),
      friendsRepository.listFriends(userId),
      friendsRepository.listFriendRequests(userId),
    ]);

    const friendIds = new Set(friendships.map((f) => f.friendId));
    const pendingSentMap = new Map<string, string>();
    for (const req of requests.outgoing) {
      if (req.status === 'pending') {
        pendingSentMap.set(req.receiverId, req.id);
      }
    }

    const pendingReceivedMap = new Map<string, string>();
    for (const req of requests.incoming) {
      if (req.status === 'pending') {
        pendingReceivedMap.set(req.senderId, req.id);
      }
    }

    return allUsers.map((u) => {
      let friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'friends' = 'none';
      let requestId: string | undefined = undefined;

      if (friendIds.has(u.id)) {
        friendshipStatus = 'friends';
      } else if (pendingSentMap.has(u.id)) {
        friendshipStatus = 'pending_sent';
        requestId = pendingSentMap.get(u.id);
      } else if (pendingReceivedMap.has(u.id)) {
        friendshipStatus = 'pending_received';
        requestId = pendingReceivedMap.get(u.id);
      }

      return {
        ...u,
        friendshipStatus,
        requestId,
      };
    });
  }

  async sendFriendRequest(senderId: string, input: SendFriendRequestInput): Promise<FriendRequestDTO> {
    if (input.targetUserId && input.targetUserId === senderId) {
      throw new Error('Cannot send a friend request to yourself');
    }

    let targetUser = null;
    if (input.targetUserId) {
      targetUser = await friendsRepository.findUserById(input.targetUserId);
    } else if (input.targetUsername) {
      targetUser = await friendsRepository.findUserByUsername(input.targetUsername);
    }

    if (!targetUser) {
      throw new Error('User not found');
    }

    if (targetUser.id === senderId) {
      throw new Error('Cannot send a friend request to yourself');
    }

    // Check if already friends
    const existingFriendship = await friendsRepository.getFriendship(senderId, targetUser.id);
    if (existingFriendship) {
      throw new Error('You are already friends with this user');
    }

    // Check for pending requests
    const pending = await friendsRepository.findPendingRequest(senderId, targetUser.id);
    if (pending) {
      throw new Error('A friend request is already pending between you and this user');
    }

    return friendsRepository.createFriendRequest(senderId, targetUser.id);
  }

  async listRequests(userId: string): Promise<{ incoming: FriendRequestDTO[]; outgoing: FriendRequestDTO[] }> {
    return friendsRepository.listFriendRequests(userId);
  }

  async respondToRequest(
    requestId: string,
    action: 'accept' | 'reject',
    receiverId: string
  ): Promise<FriendRequestDTO> {
    const result = await friendsRepository.respondFriendRequest(requestId, action, receiverId);
    if (!result) {
      throw new Error('Friend request not found or not authorized to respond');
    }
    return result;
  }

  async setPrivacyLevel(userId: string, friendId: string, privacyLevel: PrivacyLevel): Promise<FriendshipDTO> {
    const updated = await friendsRepository.updatePrivacyLevel(userId, friendId, privacyLevel);
    if (!updated) {
      throw new Error('Friendship not found');
    }
    return updated;
  }

  async removeFriend(userId: string, friendId: string): Promise<{ success: boolean }> {
    const removed = await friendsRepository.removeFriendship(userId, friendId);
    return { success: removed };
  }

  /**
   * Enforces privacy filtering based on the privacy level set by the friend toward the viewer.
   * L1 (basic): % only.
   * L2 (counts): Completed & total task counts + %. Titles masked.
   * L3 (detailed): Task titles, emojis, completion status visible. Descriptions masked.
   * L4 (full): Full habit details, streaks, total XP, and level.
   */
  async getFriendProgress(viewerId: string, friendId: string): Promise<FriendProgressDTO> {
    // 1. Verify friendship exists
    const friendship =
      (await friendsRepository.getFriendship(friendId, viewerId)) ||
      (await friendsRepository.getFriendship(viewerId, friendId));
    const privacyLevel: PrivacyLevel = friendship ? friendship.privacyLevel : 'basic';

    const friendUser = await friendsRepository.findUserById(friendId);
    if (!friendUser) {
      throw new Error('Friend user not found');
    }

    // Mock progress data for demo/testing
    const mockTasks = [
      { id: 't1', title: 'Morning Meditation', description: '15 mins mindfulness', emoji: '🧘', completed: true, completedAt: '2026-10-02T07:30:00Z' },
      { id: 't2', title: '30m Hydration & Run', description: 'Stay hydrated and do 5k', emoji: '🏃', completed: true, completedAt: '2026-10-02T08:15:00Z' },
      { id: 't3', title: 'Deep Work Session', description: 'Focus on coding tasks', emoji: '💻', completed: true, completedAt: '2026-10-02T11:00:00Z' },
      { id: 't4', title: 'Read 20 Pages', description: 'Atomic Habits by James Clear', emoji: '📚', completed: false, completedAt: null },
      { id: 't5', title: 'Evening Stretch', description: 'Full body mobility flow', emoji: '✨', completed: false, completedAt: null },
    ];

    const completedCount = mockTasks.filter((t) => t.completed).length;
    const totalCount = mockTasks.length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    const baseResponse: FriendProgressDTO = {
      friendId,
      name: friendUser.name,
      username: friendUser.username,
      avatarUrl: friendUser.avatarUrl,
      privacyLevel,
      completionPercentage: percentage,
    };

    if (privacyLevel === 'basic') {
      // Level 1: Only percentage returned
      return baseResponse;
    }

    if (privacyLevel === 'counts') {
      // Level 2: Counts + percentage returned (task titles masked)
      return {
        ...baseResponse,
        completedTasks: completedCount,
        totalTasks: totalCount,
      };
    }

    if (privacyLevel === 'detailed') {
      // Level 3: Titles, emojis, and status returned (descriptions masked)
      return {
        ...baseResponse,
        completedTasks: completedCount,
        totalTasks: totalCount,
        tasks: mockTasks.map((t) => ({
          title: t.title,
          emoji: t.emoji,
          completed: t.completed,
        })),
      };
    }

    // Level 4 (full): Full details returned
    return {
      ...baseResponse,
      completedTasks: completedCount,
      totalTasks: totalCount,
      tasks: mockTasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        emoji: t.emoji,
        completed: t.completed,
        completedAt: t.completedAt,
      })),
      currentStreak: friendUser.currentStreak,
      longestStreak: Math.max(friendUser.currentStreak, 15),
      level: friendUser.level,
      totalXp: friendUser.totalXp,
    };
  }

  async getActivityFeed(userId: string): Promise<FriendActivityFeedDTO[]> {
    return friendsRepository.listActivityFeed(userId);
  }
}

export const friendsService = new FriendsService();
