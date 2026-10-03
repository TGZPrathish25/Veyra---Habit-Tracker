/** Daily tasks management page with date switcher, filters, progress ring, and modal. */
import React, { useState, useMemo, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassButton } from '@/components/glass/GlassButton';
import {
  useDailyTasks,
  TaskItemCard,
  CreateTaskModal,
} from '@/features/daily-tasks';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  CheckCircle2,
  Lock,
  ListFilter,
} from 'lucide-react';
import { getIndianTodayDateString, shiftDateString } from '@/lib/date';

export const DailyTasksPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return getIndianTodayDateString();
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'missed'>('all');

  const {
    occurrences,
    summary,
    isLoading,
    toggleOccurrence,
    createTask,
    deleteTask,
  } = useDailyTasks(selectedDate);

  const todayStr = getIndianTodayDateString();
  const isToday = selectedDate === todayStr;
  const isPast = selectedDate < todayStr;

  const handlePrevDay = useCallback(() => {
    setSelectedDate((prev) => shiftDateString(prev, -1));
  }, []);

  const handleNextDay = useCallback(() => {
    setSelectedDate((prev) => shiftDateString(prev, 1));
  }, []);

  const handleJumpToToday = useCallback(() => {
    setSelectedDate(todayStr);
  }, [todayStr]);

  const checkIsMissed = useCallback(
    (occ: (typeof occurrences)[0]) => {
      if (occ.completed) return false;
      if (occ.isExpired !== undefined) return occ.isExpired;
      const eff = occ.effectiveDueTime || occ.task?.dueTime;
      if (!eff) return false;
      if (selectedDate < todayStr) return true;
      if (selectedDate === todayStr) {
        const now = new Date();
        const currentMin = now.getHours() * 60 + now.getMinutes();
        const [h, m] = eff.split(':').map(Number);
        return currentMin > h * 60 + m;
      }
      return false;
    },
    [selectedDate, todayStr]
  );

  const missedCount = useMemo(() => {
    return summary.missedTasks !== undefined
      ? summary.missedTasks
      : occurrences.filter(checkIsMissed).length;
  }, [summary.missedTasks, occurrences, checkIsMissed]);

  const pendingCount = useMemo(() => {
    return occurrences.filter((o) => !o.completed && !checkIsMissed(o)).length;
  }, [occurrences, checkIsMissed]);

  const filteredOccurrences = useMemo(() => {
    return occurrences.filter((occ) => {
      const isMissed = checkIsMissed(occ);
      if (filter === 'pending') return !occ.completed && !isMissed;
      if (filter === 'completed') return occ.completed;
      if (filter === 'missed') return isMissed;
      return true;
    });
  }, [occurrences, checkIsMissed, filter]);

  const formattedDateTitle = useMemo(() => {
    return new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }, [selectedDate]);

  return (
    <AppShell>
      <PageHeader
        title="Daily Habits & Tasks"
        subtitle="Small consistent actions build extraordinary results."
      />

      {/* Date Navigation & Actions Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-1">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-3 py-1 flex items-center gap-1.5 text-fluid-sm font-semibold text-white">
              <Calendar size={15} className="text-blue-500" />
              <span>{formattedDateTitle}</span>
              {isToday && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/30 text-blue-400 font-bold ml-1">
                  TODAY
                </span>
              )}
            </div>
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 transition-colors"
              title="Next Day"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {!isToday && (
            <button
              onClick={handleJumpToToday}
              className="px-3 py-2 rounded-xl text-fluid-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all"
            >
              Today
            </button>
          )}

          {isPast && (
            <span className="hidden md:inline-flex items-center gap-1 text-fluid-xs text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
              <Lock size={12} /> Read-only archive
            </span>
          )}
        </div>

        <GlassButton
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          className="flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          <span>New Habit</span>
        </GlassButton>
      </div>

      {/* Progress & Summary Bar */}
      <div className="glass p-5 rounded-2xl mb-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="text-fluid-xs text-zinc-400 font-medium">Daily Progress</div>
            <div className="text-fluid-xl font-bold text-white flex items-center gap-2">
              <span>{summary.completionPercentage}% Completed</span>
              {summary.completionPercentage === 100 && summary.totalTasks > 0 && (
                <span className="text-emerald-400 text-sm flex items-center gap-1">
                  <CheckCircle2 size={16} /> All Done!
                </span>
              )}
            </div>
          </div>
          <div className="text-fluid-sm text-zinc-300 flex items-center gap-2">
            <span>
              <span className="font-semibold text-white">{summary.completedTasks}</span> done
            </span>
            {missedCount > 0 && (
              <span className="text-rose-400">
                · <span className="font-semibold">{missedCount}</span> missed
              </span>
            )}
            <span>
              of <span className="font-semibold text-white">{summary.totalTasks}</span> total
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${summary.completionPercentage}%`,
              background: 'linear-gradient(90deg, var(--color-primary), #10b981)',
            }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-1 rounded-xl p-1 bg-white/5 border border-white/10">
          <button
            onClick={() => setFilter('all')}
            className={`py-1.5 px-3 rounded-lg text-fluid-xs font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-700/60 text-white shadow-sm'
                : 'text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All ({occurrences.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`py-1.5 px-3 rounded-lg text-fluid-xs font-medium transition-all ${
              filter === 'pending'
                ? 'bg-blue-700/60 text-white shadow-sm'
                : 'text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`py-1.5 px-3 rounded-lg text-fluid-xs font-medium transition-all ${
              filter === 'completed'
                ? 'bg-blue-700/60 text-white shadow-sm'
                : 'text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Completed ({summary.completedTasks})
          </button>
          <button
            onClick={() => setFilter('missed')}
            className={`py-1.5 px-3 rounded-lg text-fluid-xs font-medium transition-all ${
              filter === 'missed'
                ? 'bg-rose-700/60 text-white shadow-sm'
                : missedCount > 0
                ? 'text-rose-400 hover:text-rose-300'
                : 'text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Missed ({missedCount})
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-fluid-xs text-zinc-400">
          <ListFilter size={14} /> Showing {filteredOccurrences.length} items
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="glass p-12 text-center rounded-2xl">
          <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-fluid-sm text-zinc-400">Loading habits for {formattedDateTitle}...</p>
        </div>
      ) : filteredOccurrences.length > 0 ? (
        <div className="space-y-3">
          {filteredOccurrences.map((occ) => (
            <TaskItemCard
              key={occ.id}
              occurrence={occ}
              onToggle={toggleOccurrence}
              onDelete={deleteTask}
              isReadOnly={isPast}
            />
          ))}
        </div>
      ) : (
        <div className="glass p-10 md:p-12 text-center rounded-2xl border border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} />
          </div>
          <h3 className="text-fluid-base font-bold text-white mb-1">
            {occurrences.length === 0 ? 'No habits scheduled for this day' : 'No habits match this filter'}
          </h3>
          <p className="text-fluid-xs text-zinc-400 max-w-sm mx-auto mb-5">
            {occurrences.length === 0
              ? 'Start building your streak today! Create your first recurring habit and track your daily growth.'
              : 'Try switching filters to view your other habits.'}
          </p>
          {occurrences.length === 0 && (
            <GlassButton onClick={() => setIsModalOpen(true)} variant="primary" className="mx-auto">
              <Plus size={16} />
              <span>Create Your First Habit</span>
            </GlassButton>
          )}
        </div>
      )}

      {/* Creation Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createTask}
      />
    </AppShell>
  );
};
