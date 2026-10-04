import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, Users, User, Compass } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMobileNav?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMobileNav }) => {
  const tabs = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/daily', label: 'Habits', icon: CalendarCheck },
    { to: '/friends', label: 'Social', icon: Users },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden glass-heavy border-t select-none"
      style={{
        height: 'calc(var(--bottom-nav-height, 64px) + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        borderColor: 'var(--glass-border)',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
      }}
    >
      <div className="flex items-center justify-around h-[var(--bottom-nav-height,64px)] px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full min-h-[44px] text-[10.5px] font-medium transition-colors touch-manipulation ${
                  isActive ? 'text-blue-500 font-semibold' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <Icon size={19} className="mb-0.5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </NavLink>
          );
        })}

        {/* 5th Tab: Open Left Section Nav Bar for All Other Tabs */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="flex flex-col items-center justify-center flex-1 h-full min-h-[44px] text-[10.5px] font-medium text-gray-400 hover:text-white transition-colors active:scale-95 group touch-manipulation"
          aria-label="Open all tabs menu"
        >
          <Compass size={19} className="mb-0.5 text-gray-400 group-hover:text-blue-400 group-active:text-blue-400 transition-colors shrink-0" />
          <span className="group-hover:text-blue-400 group-active:text-blue-400 transition-colors truncate">More</span>
        </button>
      </div>
    </nav>
  );
};

