/** Challenges API client methods. */
import { apiClient } from '@/lib/apiClient';
import type {
  Challenge,
  ChallengeParticipant,
  CreateChallengePayload,
  UpdateChallengeProgressPayload,
} from '../types';

interface ApiResponse<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

export const challengesApi = {
  getChallenges: async (filter?: 'all' | 'active' | 'my'): Promise<Challenge[]> => {
    const params = filter ? { filter } : {};
    const res = await apiClient.get<ApiResponse<Challenge[]>>('/challenges', { params });
    return res.data.data;
  },

  getChallenge: async (
    id: string
  ): Promise<{ challenge: Challenge; participants: ChallengeParticipant[] }> => {
    const res = await apiClient.get<ApiResponse<Challenge>>(`/challenges/${id}`);
    return {
      challenge: res.data.data,
      participants: (res.data.meta?.participants as ChallengeParticipant[]) || [],
    };
  },

  createChallenge: async (payload: CreateChallengePayload): Promise<Challenge> => {
    const res = await apiClient.post<ApiResponse<Challenge>>('/challenges', payload);
    return res.data.data;
  },

  joinChallenge: async (id: string): Promise<ChallengeParticipant> => {
    const res = await apiClient.post<ApiResponse<ChallengeParticipant>>(`/challenges/${id}/join`);
    return res.data.data;
  },

  leaveChallenge: async (id: string): Promise<{ success: boolean }> => {
    const res = await apiClient.post<ApiResponse<{ success: boolean }>>(`/challenges/${id}/leave`);
    return res.data.data;
  },

  updateProgress: async (
    id: string,
    payload: UpdateChallengeProgressPayload
  ): Promise<{ participant: ChallengeParticipant; xpAwarded?: number }> => {
    const res = await apiClient.post<ApiResponse<ChallengeParticipant>>(`/challenges/${id}/progress`, payload);
    return {
      participant: res.data.data,
      xpAwarded: res.data.meta?.xpAwarded as number | undefined,
    };
  },
};
