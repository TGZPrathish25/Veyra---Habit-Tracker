/**
 * MobileNavDrawer — Elegant left slide-out navigation bar specifically for mobile view.
 * Provides instant access to all tabs (Weekly Plan, Monthly Goals, Calendar, History,
 * Challenges, Leaderboard, Settings, etc.) without altering desktop view.
 */
import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  CalendarCheck,
  CalendarRange,
  Target,
  Calendar,
  History,
  Users,
  Trophy,
  Award,
  Bell,
  Settings,
  User as UserIcon,
  LogOut,
  Flame,
  ChevronRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useStreaks, useGamification } from '@/features/gamification';
import { useNotifications } from '@/features/notifications';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavSection {
  title: string;
  items: {
    to: string;
    label: string;
    description: string;
    icon: LucideIcon;
    badge?: string | number | null;
    isPrimary?: boolean;
  }[];
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { dailyStreak } = useStreaks();
  const { level, progressPercentage } = useGamification();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  // Close drawer automatically on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  const navSections: NavSection[] = [
    {
      title: 'Planning & Routines',
      items: [
        {
          to: '/daily',
          label: 'Daily Habits',
          description: "Today's check-ins & scheduled times",
          icon: CalendarCheck,
          isPrimary: true,
        },
        {
          to: '/weekly',
          label: 'Weekly Plan',
          description: 'Focus sprint & Sunday planning',
          icon: CalendarRange,
        },
        {
          to: '/monthly',
          label: 'Monthly Goals',
          description: 'Milestones & monthly review',
          icon: Target,
        },
        {
          to: '/calendar',
          label: 'Calendar Heatmap',
          description: 'Month visual completion grid',
          icon: Calendar,
        },
        {
          to: '/history',
          label: 'History & Archive',
          description: 'Past logs, months & trends',
          icon: History,
        },
        {
          to: '/dashboard',
          label: 'Analytics Dashboard',
          description: 'Overall growth telemetry',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Community & Compete',
      items: [
        {
          to: '/challenges',
          label: 'Challenges & Quests',
          description: 'Sprint races with friends',
          icon: Trophy,
        },
        {
          to: '/leaderboard',
          label: 'Leaderboard',
          description: 'Top XP rankings & tiers',
          icon: Award,
        },
        {
          to: '/friends',
          label: 'Friends & Social',
          description: 'Activity feed & accountability',
          icon: Users,
        },
      ],
    },
    {
      title: 'Personal & System',
      items: [
        {
          to: '/notifications',
          label: 'Notifications',
          description: 'Activity updates & alerts',
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : null,
        },
        {
          to: '/profile',
          label: 'Player Profile',
          description: 'Badges, level & statistics',
          icon: UserIcon,
        },
        {
          to: '/settings',
          label: 'App Settings',
          description: 'Preferences, notifications & sound',
          icon: Settings,
        },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-start lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Left Drawer Panel */}
      <aside
        className="relative z-10 w-[84%] max-w-[340px] h-full flex flex-col bg-zinc-950/95 border-r border-white/10 shadow-2xl backdrop-blur-xl animate-in slide-in-from-left duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        aria-label="Mobile Navigation"
      >
        {/* Decorative ambient ambient glow */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-44 h-44 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header Section */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-lg ring-1 ring-white/20"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
            >
              V
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-fluid-base tracking-tight text-white">Veyra</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  MOBILE
                </span>
              </div>
              <span className="text-[11px] block font-medium text-zinc-400">Navigation Menu</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card Profile Widget */}
        {user && (
          <div className="p-3.5 mx-3.5 mt-3.5 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 shadow-sm relative z-10">
            <div className="flex items-center justify-between gap-3">
              <NavLink
                to="/profile"
                onClick={onClose}
                className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition-opacity"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md ring-1 ring-white/15"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                >
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-fluid-xs font-semibold truncate text-white">
                    {user.name || user.username || 'Adventurer'}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <span className="font-medium text-blue-400">Lvl {level || user.level || 1}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-orange-400 font-semibold">
                      <Flame size={11} /> {dailyStreak}d
                    </span>
                  </div>
                </div>
              </NavLink>

              <NavLink
                to="/profile"
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/5 transition-colors"
                title="View Profile"
              >
                <ChevronRight size={16} />
              </NavLink>
            </div>

            {/* Level XP mini progress bar */}
            <div className="mt-2.5 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                <span>Level Progress</span>
                <span className="font-semibold text-blue-400">{progressPercentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 relative z-10">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <div className="px-2.5 text-[10px] font-bold tracking-wider uppercase text-zinc-400">
                {section.title}
              </div>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2.5 rounded-xl text-fluid-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                            : 'text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent active:bg-white/10'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 text-zinc-300 group-hover:text-white transition-colors shrink-0">
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate text-white leading-tight">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate leading-tight mt-0.5">
                            {item.description}
                          </div>
                        </div>
                      </div>

                      {/* Badge if any */}
                      {item.badge != null && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white shrink-0 shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Area with Sign Out & Version Info */}
        <div className="p-3.5 border-t border-white/10 bg-zinc-950/80 mt-auto relative z-10 space-y-2">
          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-red-500/15 text-zinc-300 hover:text-red-400 border border-white/5 hover:border-red-500/30 text-fluid-xs font-medium transition-all"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          )}

          <div className="text-center text-[10px] text-zinc-400 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>Veyra Cloud Synced</span>
          </div>
        </div>
      </aside>
    </div>
  );
};
