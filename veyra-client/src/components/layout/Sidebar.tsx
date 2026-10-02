/** Sidebar — persistent on desktop (lg+), hidden on mobile. */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarRange,
  Target,
  Calendar,
  BarChart3,
  History,
  Users,
  Trophy,
  Award,
  Bell,
  Settings,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/daily', label: 'Daily Habits', icon: CalendarCheck },
    { to: '/weekly', label: 'Weekly Plan', icon: CalendarRange },
    { to: '/monthly', label: 'Monthly Goals', icon: Target },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/history', label: 'History', icon: History },
    { to: '/friends', label: 'Friends', icon: Users },
    { to: '/challenges', label: 'Challenges', icon: Trophy },
    { to: '/leaderboard', label: 'Leaderboard', icon: Award },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: UserIcon },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden lg:flex flex-col glass-heavy border-r"
      style={{ width: 'var(--sidebar-width)', borderColor: 'var(--glass-border)' }}
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b" style={{ borderColor: 'var(--glass-border)' }}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-md"
          style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
        >
          V
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight block" style={{ color: 'var(--color-text)' }}>
            Veyra
          </span>
          <span className="text-[11px] block font-medium" style={{ color: 'var(--color-primary)' }}>
            Build & Track
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-fluid-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      {user && (
        <div className="p-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center justify-between gap-3">
            <NavLink to="/profile" className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
              >
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-fluid-xs font-semibold truncate text-white">
                  {user.name || 'User'}
                </div>
                <div className="text-[11px] text-blue-500">Level {user.level || 1}</div>
              </div>
            </NavLink>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
