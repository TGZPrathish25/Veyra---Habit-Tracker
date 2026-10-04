/** Leaderboard React query hook. */
import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '../api/leaderboardApi';
import type { LeaderboardSortMetric } from '../types';

export function useLeaderboard(sortBy: LeaderboardSortMetric = 'xp') {
  const query = useQuery({
    queryKey: ['leaderboard', sortBy],
    queryFn: () => leaderboardApi.getLeaderboard(sortBy),
    staleTime: 60 * 1000,
  });

  return {
    entries: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
