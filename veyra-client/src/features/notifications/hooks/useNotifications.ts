import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notificationsApi';
import type { NotificationsListResponse } from '../types';
import { useNotificationPopupStore } from '../store/notificationPopupStore';
import { playNotificationChime } from '@/lib/sound';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getSocket } from '@/lib/socket';

// Global session registry to prevent duplicate toast popups within the same session
const sessionNotifiedIds = new Set<string>();

export function useNotifications(unreadOnly = false) {
  const queryClient = useQueryClient();
  const queryKey = ['notifications', unreadOnly];
  const { user } = useAuthStore();
  const { showPopup } = useNotificationPopupStore();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<NotificationsListResponse>({
    queryKey,
    queryFn: () => notificationsApi.getNotifications(unreadOnly),
    staleTime: 1000 * 15, // 15 seconds
    refetchInterval: 1000 * 20, // Check every 20 seconds for timely 9:30 PM reminder
  });

  // Real-time Socket.IO listener for immediate notification popups
  useEffect(() => {
    if (!user?.id) return;
    try {
      const socket = getSocket();
      const eventName = `notification:${user.id}`;

      const handleRealtimeNotif = (notif: {
        id?: string;
        title: string;
        body: string;
        type?: string;
        date?: string;
      }) => {
        const notifId = notif.id || `live_${Date.now()}`;
        if (!sessionNotifiedIds.has(notifId)) {
          sessionNotifiedIds.add(notifId);
          showPopup({
            id: notifId,
            title: notif.title,
            body: notif.body,
            type: notif.type,
            date: notif.date,
          });
          playNotificationChime();
          sendBrowserPushNotification(notif.title, notif.body);
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      };

      socket.on(eventName, handleRealtimeNotif);
      return () => {
        socket.off(eventName, handleRealtimeNotif);
      };
    } catch {
      // Socket not available
    }
  }, [user?.id, showPopup, queryClient]);

  // Watch query data for new unread notifications (e.g. 9:30 PM daily completion reminder)
  useEffect(() => {
    if (!data?.notifications) return;
    for (const notif of data.notifications) {
      if (!notif.read && !sessionNotifiedIds.has(notif.id)) {
        sessionNotifiedIds.add(notif.id);
        // Show floating toast popup on screen
        showPopup({
          id: notif.id,
          title: notif.title,
          body: notif.body,
          type: notif.type,
          data: notif.data,
          createdAt: notif.createdAt,
        });
        playNotificationChime();
        sendBrowserPushNotification(notif.title, notif.body);
        break; // Display one prominent popup at a time
      }
    }
  }, [data?.notifications, showPopup]);

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

/** Dispatch an in-browser or PWA push notification if permitted. */
export async function sendBrowserPushNotification(
  title: string,
  body: string,
  icon = '/icons/icon-192.png'
): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      // Prefer ServiceWorker showNotification if available (essential for mobile/PWA)
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          if (reg && typeof reg.showNotification === 'function') {
            await reg.showNotification(title, {
              body,
              icon,
              badge: '/icons/icon-192.png',
              tag: 'veyra-daily-reminder',
            });
            return;
          }
        } catch {
          // fallback to standard notification
        }
      }

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
