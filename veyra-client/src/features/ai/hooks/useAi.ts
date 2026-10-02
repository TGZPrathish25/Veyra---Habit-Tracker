/** AI hooks for monthly reflection generation and productivity insights. */
import { useQuery, useMutation } from '@tanstack/react-query';
import { aiApi } from '../api/aiApi';
import type { MonthlyReflectionResponse, ProductivityInsightsResponse } from '../types';

export function useAiReflection() {
  const mutation = useMutation({
    mutationFn: ({
      year,
      month,
      customPrompt,
    }: {
      year: number;
      month: number;
      customPrompt?: string;
    }) => aiApi.generateReflection(year, month, customPrompt),
  });

  return {
    generateReflection: mutation.mutateAsync,
    reflectionData: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

export function useProductivityInsights(days = 30) {
  const { data, isLoading, isError, error, refetch } = useQuery<ProductivityInsightsResponse>({
    queryKey: ['ai-insights', days],
    queryFn: () => aiApi.getInsights(days),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    insights: data?.insights ?? [],
    summaryScore: data?.summaryScore ?? 75,
    weeklyPaceRecommendation: data?.weeklyPaceRecommendation ?? 'Steady pace — maintain current load.',
    source: data?.source ?? 'analytical_engine',
    isLoading,
    isError,
    error,
    refetch,
  };
}
