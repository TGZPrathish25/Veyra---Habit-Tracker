/** Slide-out notification drawer for quick access anywhere in the app. */
import React from 'react';
import { Link } from 'react-router-dom';
import { X, Bell, CheckCheck, ArrowRight } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationCard } from './NotificationCard';
import { GlassButton } from '@/components/glass/GlassButton';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Panel */}
      <div
        className="glass-heavy relative z-10 w-full max-w-sm sm:max-w-md h-full flex flex-col border-l border-white/10 p-5 shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="text-fluid-base font-bold text-white">Notifications</h2>
              <p className="text-[11px] text-zinc-400">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-[11px] text-blue-500 hover:text-blue-400 font-semibold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
              >
                <CheckCheck size={14} /> Mark all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {isLoading ? (
            <div className="space-y-3 py-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell size={40} className="mx-auto text-zinc-600 mb-2" />
              <p className="text-fluid-sm font-semibold text-white">No notifications</p>
              <p className="text-fluid-xs text-zinc-400">
                You're all caught up with friend updates and milestones.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                onMarkAsRead={(id) => markAsRead(id)}
                onDelete={(id) => deleteNotification(id)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 mt-auto">
          <Link
            to="/notifications"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-blue-700/30 text-zinc-200 hover:text-gray-900 dark:hover:text-white border border-white/10 hover:border-blue-500/40 text-fluid-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <span>View All Notifications Page</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
