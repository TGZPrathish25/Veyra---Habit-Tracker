/** Friends API calls via apiClient. */
import { apiClient } from '@/lib/apiClient';
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

export const friendsApi = {
  getFriends: async (): Promise<Friendship[]> => {
    const res = await apiClient.get<ApiResponse<Friendship[]>>('/friends');
    return res.data.data;
  },

  getDiscoverUsers: async (): Promise<DiscoverUser[]> => {
    const res = await apiClient.get<ApiResponse<DiscoverUser[]>>('/friends/discover');
    return res.data.data;
  },

  getRequests: async (): Promise<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }> => {
    const res = await apiClient.get<ApiResponse<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>>(
      '/friends/requests'
    );
    return res.data.data;
  },

  sendRequest: async (payload: SendFriendRequestPayload): Promise<FriendRequest> => {
    const res = await apiClient.post<ApiResponse<FriendRequest>>('/friends/requests', payload);
    return res.data.data;
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
    const res = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/friends/${friendId}`);
    return res.data.data;
  },

  getFriendProgress: async (friendId: string): Promise<FriendProgress> => {
    const res = await apiClient.get<ApiResponse<FriendProgress>>(`/friends/${friendId}/progress`);
    return res.data.data;
  },

  getFeed: async (): Promise<FriendActivityFeedItem[]> => {
    const res = await apiClient.get<ApiResponse<FriendActivityFeedItem[]>>('/friends/feed');
    return res.data.data;
  },
};
