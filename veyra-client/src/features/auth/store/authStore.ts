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
  setAuth: (user: User, settings: UserSettings | null, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      settings: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (user, settings, token) =>
        set({
          user,
          settings,
          token,
          isAuthenticated: true,
          isLoading: false,
        }),
      clearAuth: () =>
        set({
          user: null,
          settings: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        }),
      updateUser: (fields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...fields } : null,
        })),
      updateSettings: (fields) =>
        set((state) => ({
          settings: state.settings ? { ...state.settings, ...fields } : null,
        })),
      setLoading: (isLoading) => set({ isLoading }),
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
