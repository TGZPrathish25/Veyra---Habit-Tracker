/** Notifications Center page with filter tabs, push permission toggle, and real-time updates. */
import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  useNotifications,
  NotificationCard,
  requestNotificationPermission,
} from '@/features/notifications';
import {
  Bell,
  CheckCheck,
  BellRing,
  Inbox,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [pushStatus, setPushStatus] = useState<string>(() =>
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported'
  );

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(filter === 'unread');

  const handleEnablePush = async () => {
    const perm = await requestNotificationPermission();
    setPushStatus(perm);
  };

  return (
    <AppShell>
      <PageHeader
        title="Notification Center"
        subtitle="Stay updated on friend requests, challenge milestones, daily streak alerts, and leveling rewards."
      />

      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
              Unread Alerts
            </div>
            <div className="text-fluid-2xl font-black text-white mt-0.5">{unreadCount}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Bell size={24} />
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              Total Recorded
            </div>
            <div className="text-fluid-2xl font-black text-white mt-0.5">{notifications.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Inbox size={24} />
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Web Push Delivery
            </div>
            <div className="text-fluid-xs font-bold text-white mt-1 capitalize">
              {pushStatus === 'granted' ? 'Enabled' : pushStatus}
            </div>
          </div>
          {pushStatus !== 'granted' && pushStatus !== 'unsupported' ? (
            <button
              onClick={handleEnablePush}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 text-[11px] font-bold transition-all"
            >
              Enable
            </button>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck size={24} />
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs and Actions Bar */}
      <div className="glass p-3.5 rounded-2xl border border-white/10 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-4 py-2 rounded-xl text-fluid-xs font-bold transition-all border',
              filter === 'all'
                ? 'bg-purple-500/20 text-purple-200 border-purple-400/40 shadow-sm'
                : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/5'
            )}
          >
            All Notifications
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              'px-4 py-2 rounded-xl text-fluid-xs font-bold transition-all border flex items-center gap-1.5',
              filter === 'unread'
                ? 'bg-purple-500/20 text-purple-200 border-purple-400/40 shadow-sm'
                : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/5'
            )}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-fluid-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass p-5 rounded-2xl border border-white/5 h-20 animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass p-12 rounded-3xl border border-white/5 text-center">
            <BellRing size={48} className="mx-auto text-zinc-600 mb-3" />
            <h3 className="text-fluid-lg font-bold text-white mb-1">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-fluid-xs text-zinc-400">
              When friends send invites or you reach streaks and milestones, alerts will appear here.
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
    </AppShell>
  );
};
