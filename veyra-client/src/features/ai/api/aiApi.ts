/** AI feature API client. */
import { apiClient } from '@/lib/apiClient';
import type { MonthlyReflectionResponse, ProductivityInsightsResponse } from '../types';

export const aiApi = {
  async generateReflection(
    year: number,
    month: number,
    customPrompt?: string
  ): Promise<MonthlyReflectionResponse> {
    const res = await apiClient.post<{ data: MonthlyReflectionResponse }>('/ai/reflection', {
      year,
      month,
      customPrompt,
    });
    return res.data.data;
  },

  async getInsights(days = 30): Promise<ProductivityInsightsResponse> {
    const res = await apiClient.get<{ data: ProductivityInsightsResponse }>(
      `/ai/insights?days=${days}`
    );
    return res.data.data;
  },
};
