/** History and monthly snapshots TanStack Query hooks. */
import { useQuery } from '@tanstack/react-query';
import { historyApi } from '../api/historyApi';
import type { YearTree, MonthSnapshot } from '../types';

export function useHistoryTree() {
  const {
    data: tree = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<YearTree[]>({
    queryKey: ['history-tree'],
    queryFn: historyApi.getTree,
    staleTime: 1000 * 60,
  });

  return {
    tree,
    years: tree.map((t) => t.year),
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useMonthSnapshot(year: number, month: number) {
  const {
    data: snapshot,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MonthSnapshot>({
    queryKey: ['history-snapshot', year, month],
    queryFn: () => historyApi.getMonthSnapshot(year, month),
    enabled: !!year && !!month,
    staleTime: 1000 * 60,
  });

  return {
    snapshot,
    days: snapshot?.days ?? [],
    isLoading,
    isError,
    error,
    refetch,
  };
}
