import React from 'react';
import { Providers } from './providers';
import { AppRouter } from './router';
import { useKeepAlive } from '@/hooks/useKeepAlive';
import { useAuthInit } from '@/features/auth';

export const App: React.FC = () => {
  useKeepAlive();
  useAuthInit();

  return (
    <Providers>
      <AppRouter />
    </Providers>
  );
};

export default App;

