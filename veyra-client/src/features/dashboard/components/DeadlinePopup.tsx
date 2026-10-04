/**
 * DeadlinePopup — Floating glass alert toast warning users of impending habit deadlines (<3h, <30min, overdue).
 */
import React, { useState, useEffect } from 'react';
import { useDailyTasks } from '@/features/daily-tasks';
import { AlertTriangle, Clock, CheckCircle2, X } from 'lucide-react';
import { GlassButton } from '@/components/glass/GlassButton';

interface UrgentItem {
  id: string;
  title: string;
  dueTime: string;
  status: 'urgent' | 'approaching' | 'overdue';
  minutesLeft: number;
}

export const DeadlinePopup: React.FC = () => {
  const { occurrences, toggleOccurrence } = useDailyTasks();
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const [urgentItem, setUrgentItem] = useState<UrgentItem | null>(null);

  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMin = currentHours * 60 + currentMinutes;

      // Filter uncompleted tasks with due times
      for (const occ of occurrences) {
        if (occ.completed || dismissed[occ.id]) continue;

        const dueStr = occ.effectiveDueTime || occ.task?.dueTime || '21:00';
        const [dh, dm] = dueStr.split(':').map(Number);
        const dueMin = (isNaN(dh) ? 21 : dh) * 60 + (isNaN(dm) ? 0 : dm);
        const taskTitle = occ.task?.title || 'Daily Habit';

        const diffMin = dueMin - currentTotalMin;

        if (diffMin < 0 && Math.abs(diffMin) < 180) {
          // Overdue within last 3 hours
          setUrgentItem({
            id: occ.id,
            title: taskTitle,
            dueTime: dueStr,
            status: 'overdue',
            minutesLeft: diffMin,
          });
          return;
        } else if (diffMin >= 0 && diffMin <= 30) {
          // Urgent < 30 mins
          setUrgentItem({
            id: occ.id,
            title: taskTitle,
            dueTime: dueStr,
            status: 'urgent',
            minutesLeft: diffMin,
          });
          return;
        } else if (diffMin > 30 && diffMin <= 180) {
          // Approaching < 3 hours
          setUrgentItem({
            id: occ.id,
            title: taskTitle,
            dueTime: dueStr,
            status: 'approaching',
            minutesLeft: diffMin,
          });
          return;
        }
      }

      setUrgentItem(null);
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 30000);
    return () => clearInterval(interval);
  }, [occurrences, dismissed]);

  if (!urgentItem) return null;

  const handleComplete = async () => {
    await toggleOccurrence(urgentItem.id, true);
    setDismissed((prev) => ({ ...prev, [urgentItem.id]: true }));
    setUrgentItem(null);
  };

  const handleDismiss = () => {
    setDismissed((prev) => ({ ...prev, [urgentItem.id]: true }));
    setUrgentItem(null);
  };

  const badgeConfig = {
    urgent: {
      border: 'border-orange-500/30',
      bg: 'bg-orange-500/10',
      badgeBg: 'bg-orange-500/20 text-orange-300',
      label: 'Urgent Deadline (<30m)',
      icon: <Clock size={16} className="text-orange-400 animate-pulse" />,
    },
    approaching: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      badgeBg: 'bg-amber-500/20 text-amber-300',
      label: 'Approaching Deadline',
      icon: <Clock size={16} className="text-amber-400" />,
    },
    overdue: {
      border: 'border-rose-500/30',
      bg: 'bg-rose-500/10',
      badgeBg: 'bg-rose-500/20 text-rose-300',
      label: 'Past Due',
      icon: <AlertTriangle size={16} className="text-rose-400" />,
    },
  }[urgentItem.status];

  return (
    <aside
      role="alert"
      aria-live="polite"
      data-testid="dashboard-deadlinepopup"
      className={`fixed bottom-[calc(var(--bottom-nav-height,64px)+env(safe-area-inset-bottom,0px)+0.75rem)] lg:bottom-6 right-4 sm:right-6 z-40 max-w-sm w-[calc(100%-2rem)] glass p-4 rounded-2xl border ${badgeConfig.border} ${badgeConfig.bg} shadow-2xl backdrop-blur-xl animate-slideUp`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {badgeConfig.icon}
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${badgeConfig.badgeBg}`}>
            {badgeConfig.label}
          </span>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss deadline alert"
          className="p-1 rounded-lg text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      <div className="mb-3">
        <h4 className="text-fluid-sm font-semibold text-white truncate">{urgentItem.title}</h4>
        <p className="text-fluid-xs text-zinc-400">
          Due by {urgentItem.dueTime} —{' '}
          {urgentItem.minutesLeft < 0
            ? `${Math.abs(urgentItem.minutesLeft)}m overdue`
            : `${urgentItem.minutesLeft}m remaining`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <GlassButton
          variant="primary"
          size="sm"
          onClick={handleComplete}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5"
        >
          <CheckCircle2 size={14} />
          <span>Mark Completed (+10 XP)</span>
        </GlassButton>
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-1.5 rounded-xl text-fluid-xs text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/5 transition-colors"
        >
          Snooze
        </button>
      </div>
    </aside>
  );
};
