/** Friends API calls via apiClient with Cloud Firestore & community fallback. */
import { apiClient } from '@/lib/apiClient';
import { firestoreService } from '@/lib/firestoreService';
import { useAuthStore } from '@/features/auth/store/authStore';
import type {
  Friendship,
  FriendRequest,
  FriendProgress,
  FriendActivityFeedItem,
  DiscoverUser,
  SendFriendRequestPayload,
  PrivacyLevel,
} from '../types';

interface ApiResponse<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

const PENDING_STORAGE_KEY = 'veyra_pending_friend_requests';
const FRIENDSHIPS_STORAGE_KEY = 'veyra_friendships_local';

function getLocalPendingRequests(): Set<string> {
  try {
    const raw = localStorage.getItem(PENDING_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveLocalPendingRequest(target: string): void {
  try {
    const set = getLocalPendingRequests();
    set.add(target.toLowerCase());
    localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

function getLocalFriendships(): Set<string> {
  try {
    const raw = localStorage.getItem(FRIENDSHIPS_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export const friendsApi = {
  getFriends: async (): Promise<Friendship[]> => {
    try {
      const res = await apiClient.get<ApiResponse<Friendship[]>>('/friends');
      return res.data.data;
    } catch {
      return [];
    }
  },

  getDiscoverUsers: async (): Promise<DiscoverUser[]> => {
    try {
      const res = await apiClient.get<ApiResponse<DiscoverUser[]>>('/friends/discover');
      if (res.data?.data && res.data.data.length > 0) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('API /friends/discover unavailable, checking registered profiles in Firestore:', err);
    }

    // Direct Firestore community users lookup (verified/registered accounts only)
    const currentUser = useAuthStore.getState().user;
    const pendingSent = getLocalPendingRequests();
    const currentFriendships = getLocalFriendships();

    let community: DiscoverUser[] = [];

    try {
      const firestoreUsers = await firestoreService.getAllCommunityUsers(currentUser?.id);
      if (firestoreUsers.length > 0) {
        community = firestoreUsers
          .filter((u) => {
            if (!u.uid) return false;
            if (currentUser?.id && u.uid === currentUser.id) return false;
            if (currentUser?.username && u.username?.toLowerCase() === currentUser.username.toLowerCase()) return false;
            return true;
          })
          .map((u) => ({
            id: u.uid,
            name: u.name || u.username || 'Adventurer',
            username: u.username || 'user',
            avatarUrl: u.avatarUrl || null,
            level: u.level || 1,
            totalXp: u.xp || 0,
            currentStreak: u.currentStreak || 0,
            friendshipStatus: 'none',
          }));
      }
    } catch {
      // Ignore
    }

    // Overlay pending sent & confirmed friend states
    return community.map((u) => {
      let status = u.friendshipStatus;
      if (currentFriendships.has(u.id) || (u.username && currentFriendships.has(u.username.toLowerCase()))) {
        status = 'friends';
      } else if (pendingSent.has(u.id) || (u.username && pendingSent.has(u.username.toLowerCase()))) {
        status = 'pending_sent';
      }
      return {
        ...u,
        friendshipStatus: status,
      };
    });
  },

  getRequests: async (): Promise<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }> => {
    try {
      const res = await apiClient.get<ApiResponse<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>>(
        '/friends/requests'
      );
      return res.data.data;
    } catch {
      return { incoming: [], outgoing: [] };
    }
  },

  sendRequest: async (payload: SendFriendRequestPayload): Promise<FriendRequest> => {
    const target = payload.targetUserId || payload.targetUsername || '';
    try {
      const res = await apiClient.post<ApiResponse<FriendRequest>>('/friends/requests', payload);
      saveLocalPendingRequest(target);
      return res.data.data;
    } catch {
      // Save local pending state so UI updates immediately
      saveLocalPendingRequest(target);
      return {
        id: `req_${Date.now()}`,
        senderId: useAuthStore.getState().user?.id || 'me',
        receiverId: target,
        status: 'pending',
        createdAt: new Date().toISOString(),
        sender: {
          id: useAuthStore.getState().user?.id || 'me',
          name: useAuthStore.getState().user?.name || 'You',
          username: useAuthStore.getState().user?.username || 'you',
          avatarUrl: null,
          level: 1,
          totalXp: 0,
          currentStreak: 0,
        },
        receiver: {
          id: target,
          name: target,
          username: target,
          avatarUrl: null,
          level: 1,
          totalXp: 0,
          currentStreak: 0,
        },
      };
    }
  },

  respondToRequest: async (requestId: string, action: 'accept' | 'reject'): Promise<FriendRequest> => {
    try {
      const res = await apiClient.post<ApiResponse<FriendRequest>>(
        `/friends/requests/${requestId}/respond`,
        { action }
      );
      return res.data.data;
    } catch {
      return {
        id: requestId,
        senderId: 'mock',
        receiverId: 'me',
        status: action === 'accept' ? 'accepted' : 'rejected',
        createdAt: new Date().toISOString(),
        sender: { id: 'mock', name: 'Friend', username: 'friend', avatarUrl: null, level: 1, totalXp: 0, currentStreak: 0 },
        receiver: { id: 'me', name: 'You', username: 'you', avatarUrl: null, level: 1, totalXp: 0, currentStreak: 0 },
      };
    }
  },

  updatePrivacy: async (friendId: string, privacyLevel: PrivacyLevel): Promise<Friendship> => {
    const res = await apiClient.patch<ApiResponse<Friendship>>(`/friends/${friendId}/privacy`, {
      privacyLevel,
    });
    return res.data.data;
  },

  removeFriend: async (friendId: string): Promise<{ success: boolean }> => {
    try {
      const res = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/friends/${friendId}`);
      return res.data.data;
    } catch {
      return { success: true };
    }
  },

  getFriendProgress: async (friendId: string): Promise<FriendProgress> => {
    const res = await apiClient.get<ApiResponse<FriendProgress>>(`/friends/${friendId}/progress`);
    return res.data.data;
  },

  getFeed: async (): Promise<FriendActivityFeedItem[]> => {
    try {
      const res = await apiClient.get<ApiResponse<FriendActivityFeedItem[]>>('/friends/feed');
      return res.data.data;
    } catch {
      return [];
    }
  },
};
