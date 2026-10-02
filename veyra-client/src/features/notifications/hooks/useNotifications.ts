/** Notifications TanStack Query hook and Web Notification API integration. */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notificationsApi';
import type { NotificationsListResponse } from '../types';

export function useNotifications(unreadOnly = false) {
  const queryClient = useQueryClient();
  const queryKey = ['notifications', unreadOnly];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<NotificationsListResponse>({
    queryKey,
    queryFn: () => notificationsApi.getNotifications(unreadOnly),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Poll every minute
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    isError,
    error,
    refetch,
    markAsRead: markReadMutation.mutateAsync,
    markAllAsRead: markAllReadMutation.mutateAsync,
    deleteNotification: deleteMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
  };
}

/** Request browser notification permission. */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.requestPermission();
}

/** Dispatch an in-browser push notification if permitted. */
export function sendBrowserPushNotification(title: string, body: string, icon = '/icons/icon-192.png'): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon,
        badge: '/icons/icon-192.png',
      });
    } catch {
      // Ignore notification failures on some restricted platforms
    }
  }
}
