/** Root App component. */
import React from 'react';
import { Providers } from './providers';
import { AppRouter } from './router';
import { useKeepAlive } from '@/hooks/useKeepAlive';

export const App: React.FC = () => {
  useKeepAlive();

  return (
    <Providers>
      <AppRouter />
    </Providers>
  );
};

export default App;

