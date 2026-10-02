/** Axios instance with base URL, Firebase ID-token interceptor, and error normalizer. */
import axios from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/features/auth/store/authStore';

export const apiClient = axios.create({
  baseURL: `${env.VITE_API_URL.replace(/\/+$/, '')}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear expired credentials
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
