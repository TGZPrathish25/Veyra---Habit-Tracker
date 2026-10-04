import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileNavDrawer } from './MobileNavDrawer';
import { DeadlinePopup } from '@/features/dashboard/components/DeadlinePopup';
import { NotificationPopup } from '@/features/notifications/components/NotificationPopup';
import { InstallAppPrompt } from '@/components/pwa/InstallAppPrompt';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* WCAG 2.1 AA Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 px-4 py-2 bg-blue-700 text-white font-semibold rounded-xl shadow-2xl border border-blue-500 focus:outline-none focus:ring-2 focus:ring-white transition-all text-xs"
      >
        Skip to main content
      </a>

      {/* Desktop Persistent Sidebar (Unchanged, only visible on lg+) */}
      <Sidebar />

      <div className="lg:ml-[var(--sidebar-width)] transition-[margin] duration-300 min-h-screen flex flex-col">
        {/* Responsive Header TopBar with Mobile Hamburger Trigger */}
        <TopBar onOpenMobileNav={() => setIsMobileNavOpen(true)} />

        {/* Main Accessible Content Landmark */}
        <main
          id="main-content"
          tabIndex={-1}
          role="main"
          className="flex-1 p-[var(--page-padding)] pb-[calc(var(--bottom-nav-height,64px)+env(safe-area-inset-bottom,0px)+1.5rem)] lg:pb-[var(--page-padding)] focus:outline-none"
        >
          {children}
        </main>
      </div>

      {/* Mobile Fixed Glass BottomNav with More Trigger */}
      <MobileBottomNav onOpenMobileNav={() => setIsMobileNavOpen(true)} />

      {/* Mobile Left Section Slide-Out Navigation Bar */}
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Global Proactive Deadline Alerts */}
      <DeadlinePopup />

      {/* Global Floating Realtime Notification Toast Popup */}
      <NotificationPopup />

      {/* Progressive Web App Install Prompt Banner */}
      <InstallAppPrompt />
    </div>
  );
};
