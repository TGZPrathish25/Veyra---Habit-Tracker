/** TanStack Query client configuration. */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes fresh
      gcTime: 10 * 60 * 1000, // Keep in memory for 10 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Prevents spamming API when toggling tabs
      refetchOnReconnect: true,
    },
  },
});
