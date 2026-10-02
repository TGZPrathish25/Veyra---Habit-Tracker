/** Guards routes that should only be accessible when NOT authenticated. */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div
          className="animate-spin rounded-full h-10 w-10 border-2 border-transparent border-t-purple-500"
          style={{ borderTopColor: 'var(--color-primary)' }}
        />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
