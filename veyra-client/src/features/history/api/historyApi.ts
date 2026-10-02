/** History and archive API client methods. */
import { apiClient } from '@/lib/apiClient';
import type { YearTree, MonthSnapshot } from '../types';

interface ApiResponse<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

export const historyApi = {
  getTree: async (): Promise<YearTree[]> => {
    const res = await apiClient.get<ApiResponse<YearTree[]>>('/history/tree');
    return res.data.data;
  },

  getMonthSnapshot: async (year: number, month: number): Promise<MonthSnapshot> => {
    const res = await apiClient.get<ApiResponse<MonthSnapshot>>(`/history/${year}/${month}`);
    return res.data.data;
  },
};
