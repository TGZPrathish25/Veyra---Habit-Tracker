/** TopBar — responsive app header with notification bell, streak badge, and user drawer. */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Flame, User as UserIcon, Menu } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useStreaks } from '@/features/gamification';
import { useNotifications, NotificationDrawer } from '@/features/notifications';
import { cn } from '@/lib/cn';

interface TopBarProps {
  onOpenMobileNav?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileNav }) => {
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
        {/* Left: Mobile Hamburger & Brand / Desktop Welcome Title */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Left Section Nav Bar Toggle Button */}
          <button
            type="button"
            onClick={onOpenMobileNav}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 rounded-xl text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all flex items-center justify-center"
          >
            <Menu size={18} />
          </button>

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
            Welcome to <span className="font-semibold text-blue-400">Veyra Productivity</span>
          </div>
        </div>

        {/* Right: Notification Bell & Profile Avatar with Streak */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Notification Bell Button */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open notifications drawer"
            className="relative p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 border border-white/5 transition-all"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center shadow-lg border border-blue-400/40 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Pill with Streak directly before our name */}
          {user && (
            <Link
              to="/profile"
              className="flex items-center gap-2 p-1 pl-2 sm:pl-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-fluid-xs transition-colors group"
            >
              {/* Daily Streak Badge directly before our name */}
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300 font-bold text-[11px] group-hover:bg-orange-500/25 group-hover:border-orange-500/40 transition-colors"
                title={`Current Daily Streak: ${dailyStreak} day${dailyStreak === 1 ? '' : 's'}`}
              >
                <Flame size={12} className="text-orange-400 fill-orange-500/30" />
                <span className="tabular-nums">{dailyStreak}d</span>
              </div>

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
