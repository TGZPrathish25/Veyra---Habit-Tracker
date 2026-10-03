/** Auth store — current user, token state with persistence. */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserSettings } from '../types';

interface AuthStoreState {
  user: User | null;
  settings: UserSettings | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setAuth: (user: User, settings: UserSettings | null, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      settings: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      setAuth: (user, settings, token) =>
        set({
          user,
          settings,
          token,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        }),
      clearAuth: () =>
        set({
          user: null,
          settings: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        }),
      updateUser: (fields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...fields } : (fields as User),
        })),
      updateSettings: (fields) =>
        set((state) => ({
          settings: state.settings
            ? { ...state.settings, ...fields }
            : ({
                theme: 'dark',
                friendVisibilityLevel: 2,
                leaderboardOptIn: true,
                weekStartDay: 1,
                ...fields,
              } as UserSettings),
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),
    }),
    {
      name: 'veyra-auth',
      partialize: (state) => ({
        user: state.user,
        settings: state.settings,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
