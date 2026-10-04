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

function isDummyUser(u: { id?: string; username?: string | null; name?: string | null; email?: string | null }): boolean {
  if (!u) return true;
  if (u.id === 'usr_demo' || u.id === 'demo' || u.id === 'mock') return true;
  if (u.username?.toLowerCase() === 'demo' || u.username?.toLowerCase() === 'friend') return true;
  if (u.name === 'Demo User' || u.name === 'Friend') return true;
  if (u.email?.toLowerCase().includes('demo@')) return true;
  return false;
}

export const friendsApi = {
  getFriends: async (): Promise<Friendship[]> => {
    try {
      const res = await apiClient.get<ApiResponse<Friendship[]>>('/friends');
      return (res.data?.data || []).filter((f) => !isDummyUser(f.friend));
    } catch {
      return [];
    }
  },

  getDiscoverUsers: async (): Promise<DiscoverUser[]> => {
    const currentUser = useAuthStore.getState().user;
    const currentUserId = currentUser?.id;
    const currentFirebaseUid = currentUser?.firebaseUid;
    const currentUsername = currentUser?.username?.toLowerCase();

    const isCaller = (u: { id: string; username?: string | null }) => {
      if (currentUserId && u.id === currentUserId) return true;
      if (currentFirebaseUid && u.id === currentFirebaseUid) return true;
      if (currentUsername && u.username && u.username.toLowerCase() === currentUsername) return true;
      return false;
    };

    let rawList: DiscoverUser[] = [];

    try {
      const res = await apiClient.get<ApiResponse<DiscoverUser[]>>('/friends/discover');
      if (res.data?.data && res.data.data.length > 0) {
        rawList = res.data.data;
      }
    } catch (err) {
      console.warn('API /friends/discover unavailable, checking registered profiles in Firestore:', err);
    }

    if (rawList.length === 0) {
      try {
        const firestoreUsers = await firestoreService.getAllCommunityUsers(currentUser?.id);
        rawList = firestoreUsers.map((u) => ({
          id: u.uid,
          name: u.name || u.username || 'Adventurer',
          username: u.username || 'user',
          avatarUrl: u.avatarUrl || null,
          level: u.level || 1,
          totalXp: u.xp || 0,
          currentStreak: u.currentStreak || 0,
          friendshipStatus: 'none',
        }));
      } catch {
        // Ignore
      }
    }

    // Filter dummy accounts, caller's own account, and deduplicate
    const seenIds = new Set<string>();
    const seenUsernames = new Set<string>();
    const filtered: DiscoverUser[] = [];

    for (const u of rawList) {
      if (isDummyUser(u)) continue;
      if (isCaller(u)) continue;

      const normUser = u.username?.toLowerCase().trim();
      if (seenIds.has(u.id)) continue;
      if (normUser && seenUsernames.has(normUser)) continue;

      seenIds.add(u.id);
      if (normUser) seenUsernames.add(normUser);
      filtered.push(u);
    }

    // Overlay pending sent & confirmed friend states
    const pendingSent = getLocalPendingRequests();
    const currentFriendships = getLocalFriendships();

    return filtered.map((u) => {
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
      return {
        incoming: (res.data?.data?.incoming || []).filter((r) => !isDummyUser(r.sender)),
        outgoing: (res.data?.data?.outgoing || []).filter((r) => !isDummyUser(r.receiver)),
      };
    } catch {
      return { incoming: [], outgoing: [] };
    }
  },

  sendRequest: async (payload: SendFriendRequestPayload): Promise<FriendRequest> => {
    const target = payload.targetUserId || payload.targetUsername || '';
    saveLocalPendingRequest(target);

    try {
      const res = await apiClient.post<ApiResponse<FriendRequest>>('/friends/requests', payload);
      return res.data.data;
    } catch {
      return {
        id: 'req_' + Date.now(),
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
    const res = await apiClient.post<ApiResponse<FriendRequest>>(
      `/friends/requests/${requestId}/respond`,
      { action }
    );
    return res.data.data;
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
