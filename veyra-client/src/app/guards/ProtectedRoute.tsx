/** Guards routes that require authentication. */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const location = useLocation();

  // If already authenticated via persisted session, allow immediate rendering
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If unauthenticated, wait while session initialization (cookie/Firebase) is in progress
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div
          className="animate-spin rounded-full h-10 w-10 border-2 border-transparent border-t-blue-500"
          style={{ borderTopColor: 'var(--color-primary)' }}
        />
      </div>
    );
  }

  return <Navigate to="/login" replace state={{ from: location }} />;

  return <>{children}</>;
};
