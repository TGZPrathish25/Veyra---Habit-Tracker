/**
 * useAuthInit — Persistent authentication session bootstrap.
 * Automatically checks for a valid persistent session (30-day session cookie,
 * Firebase local persistence, or stored token) on app launch and restores
 * user state seamlessly without forcing a manual re-login.
 */
import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/config/firebase';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api';
import { INDIA_TIMEZONE } from '@/lib/date';

export function useAuthInit(): void {
  const { setAuth, clearAuth, setInitialized, setLoading } = useAuthStore();
  const isStartedRef = useRef(false);

  useEffect(() => {
    if (isStartedRef.current) return;
    isStartedRef.current = true;

    setLoading(true);

    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const restoreViaBackendSession = async (): Promise<boolean> => {
      try {
        const result = await authApi.getCurrentUser();
        if (result?.user && isMounted) {
          const currentToken = useAuthStore.getState().token;
          setAuth(
            result.user,
            result.settings,
            result.token || currentToken || 'session-cookie'
          );
          return true;
        }
      } catch (err: unknown) {
        // If 401 or invalid session and not a local demo session, clear auth
        const isDemo = useAuthStore.getState().user?.email === 'demo@veyra.app';
        if (!isDemo && isMounted) {
          clearAuth();
        }
      }
      return false;
    };

    if (isFirebaseConfigured() && auth) {
      // Listen to Firebase persistent auth state
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!isMounted) return;

        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            const syncResult = await authApi.syncUser(
              {
                email: firebaseUser.email || `${firebaseUser.uid}@veyra.app`,
                name: firebaseUser.displayName || 'Veyra Adventurer',
                avatarUrl: firebaseUser.photoURL,
                timezone: INDIA_TIMEZONE,
              },
              idToken
            );

            if (isMounted) {
              setAuth(
                syncResult.user,
                syncResult.settings,
                syncResult.token || idToken
              );
            }
          } catch (err) {
            console.warn('Firebase session sync warning, checking persistent cookie:', err);
            await restoreViaBackendSession();
          } finally {
            if (isMounted) {
              setLoading(false);
              setInitialized(true);
            }
          }
        } else {
          // If no active Firebase user, check if a 30-day session cookie or token is valid
          await restoreViaBackendSession();
          if (isMounted) {
            setLoading(false);
            setInitialized(true);
          }
        }
      });
    } else {
      // Firebase not configured; restore directly via persistent session cookie / backend
      restoreViaBackendSession().finally(() => {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      });
    }

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [setAuth, clearAuth, setInitialized, setLoading]);
}
