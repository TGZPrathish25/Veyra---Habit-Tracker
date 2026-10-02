/** auth feature API — TanStack Query hooks and apiClient calls. */
import { apiClient } from '@/lib/apiClient';
import type { User, UserSettings } from '../types';

export interface SyncPayload {
  email: string;
  name?: string;
  username?: string;
  avatarUrl?: string | null;
  timezone?: string;
}

export interface AuthApiResponse {
  status: string;
  data: {
    user: User;
    settings: UserSettings | null;
  };
}

export const authApi = {
  syncUser: async (payload: SyncPayload, token?: string): Promise<AuthApiResponse['data']> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.post<AuthApiResponse>('/auth/sync', payload, { headers });
    return response.data.data;
  },

  getCurrentUser: async (): Promise<AuthApiResponse['data']> => {
    const response = await apiClient.get<AuthApiResponse>('/auth/me');
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
