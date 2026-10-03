/** Axios instance with base URL, credentials, token interceptor, and 401 retry handler. */
import axios from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/features/auth/store/authStore';
import { auth } from '@/config/firebase';

export const apiClient = axios.create({
  baseURL: `${env.VITE_API_URL.replace(/\/+$/, '')}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor: attach bearer token and refresh if near expiry
apiClient.interceptors.request.use(
  async (config) => {
    let token = useAuthStore.getState().token;

    // If Firebase user is available, getIdToken() automatically checks expiry
    // and returns a fresh valid token without forcing user re-login
    if (auth?.currentUser) {
      try {
        const freshToken = await auth.currentUser.getIdToken();
        if (freshToken) {
          token = freshToken;
        }
      } catch {
        // Fall back to stored token
      }
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 token refresh & retry before clearing auth
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Try token refresh once on 401 before giving up
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (auth?.currentUser) {
        try {
          const freshToken = await auth.currentUser.getIdToken(true);
          const user = useAuthStore.getState().user;
          const settings = useAuthStore.getState().settings;
          if (user && freshToken) {
            useAuthStore.getState().setAuth(user, settings, freshToken);
            originalRequest.headers.Authorization = `Bearer ${freshToken}`;
            return apiClient(originalRequest);
          }
        } catch {
          // Token refresh failed
        }
      }

      // If cannot be refreshed, clear stale credentials
      useAuthStore.getState().clearAuth();
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

