/** Comprehensive interactive calendar view for habits and daily completion history. */
import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMonthSnapshot, MonthCalendarGrid, DayDetailModal } from '@/features/history';
import type { DayHistory } from '@/features/history/types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCurrentYearAndMonth } from '@/lib/date';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const CalendarPage: React.FC = () => {
  const [currentYear, setCurrentYear] = useState<number>(() => getCurrentYearAndMonth().year);
  const [currentMonth, setCurrentMonth] = useState<number>(() => getCurrentYearAndMonth().month);
  const [selectedDay, setSelectedDay] = useState<DayHistory | null>(null);

  const { snapshot, isLoading } = useMonthSnapshot(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const { year, month } = getCurrentYearAndMonth();
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const monthName = MONTH_NAMES[currentMonth - 1];
  const days = snapshot?.days ?? [];

  return (
    <AppShell>
      <PageHeader
        title="Habit Calendar"
        subtitle="Visualize your daily consistency, explore habit streaks, and inspect any day's accomplishments."
      />

      {/* Month Navigation & Control Bar */}
      <div className="glass p-4 rounded-2xl border border-white/10 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-500">
            <CalendarIcon size={22} />
          </div>
          <div>
            <h2 className="text-fluid-xl font-black text-white">
              {monthName} {currentYear}
            </h2>
            <p className="text-[11px] text-zinc-400">
              {snapshot ? `${snapshot.completionRate}% average habit completion` : 'Loading...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGoToday}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-gray-900 dark:hover:text-white border border-white/10 text-fluid-xs font-semibold transition-all"
          >
            Today
          </button>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Month Quick Stats */}
      {snapshot && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="glass p-3.5 rounded-2xl border border-blue-500/20 bg-blue-500/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Completed Habits
            </span>
            <div className="text-fluid-xl font-bold text-white mt-0.5">
              {snapshot.tasksCompleted}{' '}
              <span className="text-fluid-xs font-normal text-zinc-400">/ {snapshot.totalTasks}</span>
            </div>
          </div>

          <div className="glass p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Success Rate
            </span>
            <div className="text-fluid-xl font-bold text-white mt-0.5">
              {snapshot.completionRate}%
            </div>
          </div>

          <div className="glass p-3.5 rounded-2xl border border-yellow-500/20 bg-yellow-500/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-300">
              XP Earned
            </span>
            <div className="text-fluid-xl font-bold text-white mt-0.5">+{snapshot.xpEarned}</div>
          </div>

          <div className="glass p-3.5 rounded-2xl border border-orange-500/20 bg-orange-500/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300">
              Monthly Streak
            </span>
            <div className="text-fluid-xl font-bold text-white mt-0.5">
              {snapshot.streakDays} <span className="text-fluid-xs font-normal text-zinc-400">days</span>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Grid Box */}
      <div className="glass p-5 md:p-6 rounded-3xl border border-white/10 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div className="text-fluid-xs text-zinc-400">
            Click on any day cell to view completed habits, timestamps, and notes.
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>All done</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Partial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              <span>None</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="h-96 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse flex items-center justify-center text-zinc-500 text-fluid-xs">
            Loading calendar days...
          </div>
        ) : (
          <MonthCalendarGrid days={days} onSelectDay={setSelectedDay} />
        )}
      </div>

      {/* Archive link footer banner */}
      <div className="glass p-4 rounded-2xl border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-blue-500" />
          <span className="text-fluid-xs text-zinc-300">
            Want to see archived snapshots of past years and months?
          </span>
        </div>
        <Link
          to="/history"
          className="text-fluid-xs font-semibold text-blue-500 hover:text-blue-400 inline-flex items-center gap-1"
        >
          Open Archives <ArrowRight size={13} />
        </Link>
      </div>

      {/* Day Details Modal */}
      <DayDetailModal day={selectedDay} onClose={() => setSelectedDay(null)} />
    </AppShell>
  );
};
