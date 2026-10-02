/** Analytics TanStack Query hooks. */
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';
import type { AnalyticsSummary, HeatmapDay } from '../types';

export function useAnalytics(period: '7d' | '30d' | '90d' = '30d') {
  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AnalyticsSummary>({
    queryKey: ['analytics-summary', period],
    queryFn: () => analyticsApi.getSummary(period),
    staleTime: 1000 * 60,
  });

  return {
    summary,
    trends: summary?.trends ?? [],
    weekdayBreakdown: summary?.weekdayBreakdown ?? [],
    categoryDistribution: summary?.categoryDistribution ?? [],
    averageCompletionRate: summary?.averageCompletionRate ?? 0,
    totalTasksCompleted: summary?.totalTasksCompleted ?? 0,
    totalTasksScheduled: summary?.totalTasksScheduled ?? 0,
    currentStreak: summary?.currentStreak ?? 0,
    bestStreak: summary?.bestStreak ?? 0,
    topProductiveDay: summary?.topProductiveDay ?? 'Tuesday',
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useHeatmap(days = 60) {
  const {
    data: heatmap = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<HeatmapDay[]>({
    queryKey: ['analytics-heatmap', days],
    queryFn: () => analyticsApi.getHeatmap(days),
    staleTime: 1000 * 60,
  });

  return {
    heatmap,
    isLoading,
    isError,
    refetch,
  };
}
