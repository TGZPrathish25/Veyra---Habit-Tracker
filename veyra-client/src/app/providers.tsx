/** App providers: QueryClient, Auth, Theme, Socket, Toast. */
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/config/queryClient';

interface ProvidersProps { children: React.ReactNode; }

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
