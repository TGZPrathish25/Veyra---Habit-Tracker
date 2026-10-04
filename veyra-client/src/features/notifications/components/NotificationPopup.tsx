/**
 * NotificationPopup — Floating glass alert toast that pops up when a scheduled
 * or real-time notification arrives (e.g. 9:30 PM IST daily habit completion reminder).
 */
import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Zap, Bell, X, Check, Volume2 } from 'lucide-react';
import { useNotificationPopupStore } from '../store/notificationPopupStore';
import { useNotifications, requestNotificationPermission } from '../hooks/useNotifications';

export const NotificationPopup: React.FC = () => {
  const { currentPopup, dismissPopup } = useNotificationPopupStore();
  const { markAsRead } = useNotifications();
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const canRequestPush =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'default' &&
    !hasRequestedPermission;

  // Auto-dismiss countdown
  useEffect(() => {
    if (!currentPopup) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const duration = 8000; // 8 seconds
    const intervalTime = 100;
    const step = (intervalTime / duration) * 100;

    timerRef.current = setInterval(() => {
      if (isPaused) return;
      setProgress((prev) => {
        if (prev <= 0) {
          dismissPopup();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentPopup, isPaused, dismissPopup]);

  if (!currentPopup) return null;

  const handleMarkRead = () => {
    if (currentPopup.id && !currentPopup.id.startsWith('temp_')) {
      try {
        markAsRead(currentPopup.id).catch(() => {});
      } catch {
        // ignore
      }
    }
    dismissPopup();
  };

  const handleEnablePush = async () => {
    const res = await requestNotificationPermission();
    setHasRequestedPermission(true);
    if (res === 'granted') {
      try {
        new Notification(currentPopup.title, {
          body: currentPopup.body,
          icon: '/icons/icon-192.png',
        });
      } catch {
        // ignore
      }
    }
  };

  const is100Percent =
    currentPopup.title.includes('100% Completed') ||
    currentPopup.title.includes('Perfect Day');
  const isIncomplete =
    currentPopup.title.includes('Not Completed') ||
    currentPopup.title.includes('%');

  const config = is100Percent
    ? {
        border: 'border-emerald-500/40',
        bg: 'bg-emerald-950/40',
        accentBg: 'bg-emerald-500/20 text-emerald-300',
        barColor: 'bg-emerald-400',
        icon: <Sparkles size={16} className="text-emerald-400 animate-pulse" />,
        badgeText: 'Daily Completion Goal Achieved',
      }
    : isIncomplete
    ? {
        border: 'border-amber-500/40',
        bg: 'bg-amber-950/40',
        accentBg: 'bg-amber-500/20 text-amber-300',
        barColor: 'bg-amber-400',
        icon: <Zap size={16} className="text-amber-400 animate-bounce" />,
        badgeText: '9:30 PM Habit Check-in',
      }
    : {
        border: 'border-blue-500/40',
        bg: 'bg-blue-950/40',
        accentBg: 'bg-blue-500/20 text-blue-300',
        barColor: 'bg-blue-400',
        icon: <Bell size={16} className="text-blue-400" />,
        badgeText: 'Notification',
      };

  return (
    <aside
      role="alert"
      aria-live="assertive"
      data-testid="notification-popup-toast"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed top-4 right-4 sm:right-6 z-50 max-w-sm w-[calc(100%-2rem)] glass p-4 rounded-2xl border ${config.border} ${config.bg} shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300`}
      style={{
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.6), 0 0 15px 0 rgba(59, 130, 246, 0.2)',
      }}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {config.icon}
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${config.accentBg}`}>
            {config.badgeText}
          </span>
        </div>
        <button
          type="button"
          onClick={dismissPopup}
          aria-label="Dismiss notification popup"
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Title & Body */}
      <div className="mb-3">
        <h4 className="text-fluid-sm font-bold text-white mb-0.5 leading-snug">
          {currentPopup.title}
        </h4>
        <p className="text-fluid-xs text-zinc-300 leading-relaxed">
          {currentPopup.body}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleMarkRead}
          className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-semibold text-fluid-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <Check size={14} />
          <span>Got it</span>
        </button>

        {canRequestPush && (
          <button
            type="button"
            onClick={handleEnablePush}
            title="Enable browser system notifications"
            className="py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white text-fluid-xs flex items-center gap-1 transition-all"
          >
            <Volume2 size={13} />
            <span>Enable Push</span>
          </button>
        )}

        <button
          type="button"
          onClick={dismissPopup}
          className="px-2.5 py-1.5 rounded-xl text-fluid-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          Close
        </button>
      </div>

      {/* Auto-dismiss progress timer */}
      <div className="w-full bg-white/10 h-0.5 rounded-full mt-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-100 ease-linear ${config.barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </aside>
  );
};
