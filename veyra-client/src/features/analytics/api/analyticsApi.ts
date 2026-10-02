/** Analytics API calls via apiClient. */
import { apiClient } from '@/lib/apiClient';
import type { AnalyticsSummary, HeatmapDay } from '../types';

interface ApiResponse<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

export const analyticsApi = {
  getSummary: async (period: '7d' | '30d' | '90d' = '30d'): Promise<AnalyticsSummary> => {
    const res = await apiClient.get<ApiResponse<AnalyticsSummary>>('/analytics/summary', {
      params: { period },
    });
    return res.data.data;
  },

  getHeatmap: async (days = 60): Promise<HeatmapDay[]> => {
    const res = await apiClient.get<ApiResponse<HeatmapDay[]>>('/analytics/heatmap', {
      params: { days },
    });
    return res.data.data;
  },
};
