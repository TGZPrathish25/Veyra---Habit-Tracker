/** Performance analytics dashboard with Recharts trends, day-of-week bars, and heatmaps. */
import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  useAnalytics,
  useHeatmap,
  CompletionTrendChart,
  WeekdayBreakdownChart,
  CategoryPieChart,
  CalendarHeatmap,
} from '@/features/analytics';
import { TrendingUp, Flame, Calendar, Award, CheckCircle2, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { AiProductivityInsightsCard } from '@/features/ai';
import { cn } from '@/lib/cn';

export const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const {
    trends,
    weekdayBreakdown,
    categoryDistribution,
    averageCompletionRate,
    totalTasksCompleted,
    totalTasksScheduled,
    currentStreak,
    bestStreak,
    topProductiveDay,
    isLoading,
  } = useAnalytics(period);

  const { heatmap, isLoading: isLoadingHeatmap } = useHeatmap(period === '90d' ? 90 : 60);

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <PageHeader
          title="Productivity & Habit Analytics"
          subtitle="Visualize your completion trends, discover peak performance days, and track habit consistency."
        />

        {/* Period Selector Tabs */}
        <div className="flex items-center p-1 rounded-2xl glass border border-white/10 self-start sm:self-auto shrink-0">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-fluid-xs font-semibold transition-all',
                period === p
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-fluid-xs font-semibold uppercase tracking-wider text-purple-300">
              Avg. Completion
            </span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-fluid-2xl font-black text-white">{averageCompletionRate}%</div>
          <p className="text-[11px] text-zinc-400 mt-1">Overall habit success rate</p>
        </div>

        <div className="glass p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-fluid-xs font-semibold uppercase tracking-wider text-emerald-300">
              Habits Logged
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-fluid-2xl font-black text-white">
            {totalTasksCompleted}{' '}
            <span className="text-fluid-sm font-normal text-zinc-400">/ {totalTasksScheduled}</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Total habit check-ins</p>
        </div>

        <div className="glass p-4 rounded-2xl border border-orange-500/20 bg-orange-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-fluid-xs font-semibold uppercase tracking-wider text-orange-300">
              Active Streak
            </span>
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Flame size={16} />
            </div>
          </div>
          <div className="text-fluid-2xl font-black text-white">
            {currentStreak} Days 🔥
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Personal Best: {bestStreak} Days</p>
        </div>

        <div className="glass p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-fluid-xs font-semibold uppercase tracking-wider text-blue-300">
              Peak Day
            </span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Calendar size={16} />
            </div>
          </div>
          <div className="text-fluid-2xl font-black text-white">{topProductiveDay}</div>
          <p className="text-[11px] text-zinc-400 mt-1">Highest consistency rating</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Completion Trend Over Time (2 cols) */}
        <div className="glass p-5 md:p-6 rounded-3xl border border-white/10 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-purple-400" />
              <h2 className="text-fluid-base font-bold text-white">Completion Rate Trend</h2>
            </div>
            <span className="text-fluid-xs text-zinc-400">Daily % performance</span>
          </div>
          <CompletionTrendChart data={trends} />
        </div>

        {/* Category Breakdown (1 col) */}
        <div className="glass p-5 md:p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon size={18} className="text-emerald-400" />
              <h2 className="text-fluid-base font-bold text-white">Category Distribution</h2>
            </div>
          </div>
          <CategoryPieChart data={categoryDistribution} />
        </div>
      </div>

      {/* Second Row Charts: Weekday Breakdown + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekday Breakdown */}
        <div className="glass p-5 md:p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-400" />
              <h2 className="text-fluid-base font-bold text-white">Day of Week Performance</h2>
            </div>
            <span className="text-fluid-xs text-zinc-400">Monday — Sunday</span>
          </div>
          <WeekdayBreakdownChart data={weekdayBreakdown} />
        </div>

        {/* Consistency Calendar Heatmap */}
        <div className="glass p-5 md:p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-amber-400" />
                <h2 className="text-fluid-base font-bold text-white">Consistency Calendar Heatmap</h2>
              </div>
              <span className="text-fluid-xs text-zinc-400">Daily density</span>
            </div>
            <p className="text-fluid-xs text-zinc-400 mb-4 leading-relaxed">
              Every square represents a day of habit tracking. Darker shades indicate higher completion rates.
            </p>
          </div>
          <CalendarHeatmap data={heatmap} />
        </div>
      </div>

      {/* AI Productivity Intelligence Section */}
      <div className="mt-6">
        <AiProductivityInsightsCard days={period === '7d' ? 7 : period === '90d' ? 90 : 30} />
      </div>
    </AppShell>
  );
};
