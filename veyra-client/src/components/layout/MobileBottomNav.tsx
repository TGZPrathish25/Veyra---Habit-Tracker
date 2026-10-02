/** MobileBottomNav — fixed bottom tab bar for mobile with active links. */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, Users, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const tabs = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/daily', label: 'Habits', icon: CalendarCheck },
    { to: '/friends', label: 'Social', icon: Users },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden glass-heavy border-t"
      style={{
        height: 'var(--bottom-nav-height)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        borderColor: 'var(--glass-border)',
      }}
    >
      <div className="flex items-center justify-around h-full px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[50px] min-h-[44px] text-[11px] font-medium transition-colors ${
                  isActive ? 'text-purple-400 font-semibold' : 'text-gray-400 hover:text-white'
                }`
              }
            >
              <Icon size={20} className="mb-0.5" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
