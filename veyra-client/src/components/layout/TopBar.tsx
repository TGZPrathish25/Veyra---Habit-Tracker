/** TopBar — responsive app header with notification bell, streak badge, and user drawer. */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Flame, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useStreaks } from '@/features/gamification';
import { useNotifications, NotificationDrawer } from '@/features/notifications';
import { cn } from '@/lib/cn';

export const TopBar: React.FC = () => {
  const { user } = useAuth();
  const { dailyStreak } = useStreaks();
  const { unreadCount } = useNotifications();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-30 glass border-b px-[var(--page-padding)] flex items-center justify-between"
        style={{
          height: 'var(--topbar-height)',
          borderColor: 'var(--glass-border)',
        }}
      >
        {/* Left: Mobile Brand / Title */}
        <div className="flex items-center gap-2.5">
          <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
            >
              V
            </div>
            <span className="font-bold text-fluid-sm text-white tracking-tight">Veyra</span>
          </Link>
          <div className="hidden lg:block text-fluid-xs text-zinc-400">
            Welcome to <span className="font-semibold text-purple-300">Veyra Productivity</span>
          </div>
        </div>

        {/* Right: Quick Telemetry, Notification Bell & Profile Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Streak Pill */}
          {dailyStreak > 0 && (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-300 hover:bg-orange-500/20 transition-all text-[11px] font-bold"
              title="Current Daily Streak"
            >
              <Flame size={13} className="text-orange-400" />
              <span>{dailyStreak}d streak</span>
            </Link>
          )}

          {/* Notification Bell Button */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open notifications drawer"
            className="relative p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 border border-white/5 transition-all"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 text-white text-[9px] font-black flex items-center justify-center shadow-lg border border-purple-300/40 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Mini Pill */}
          {user && (
            <Link
              to="/profile"
              className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-fluid-xs transition-colors"
            >
              <span className="font-medium text-white hidden sm:inline max-w-[120px] truncate">
                {user.name || user.username || 'Adventurer'}
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
              >
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            </Link>
          )}
        </div>
      </header>

      {/* Notifications Drawer */}
      <NotificationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
