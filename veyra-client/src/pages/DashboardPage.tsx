/** Main dashboard with live daily habits, gamification stats, and integrated productivity analytics. */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDailyTasks, TaskItemCard } from '@/features/daily-tasks';
import {
  useGamification,
  useStreaks,
  StreakFlameBadge,
  LevelProgressBar,
  LevelUpModal,
} from '@/features/gamification';
import {
  useAnalytics,
  useHeatmap,
  WeekdayBreakdownChart,
  CategoryPieChart,
  CalendarHeatmap,
} from '@/features/analytics';
import {
  Flame,
  Zap,
  Award,
  CalendarCheck,
  ArrowRight,
  Plus,
  Sparkles,
  CheckCircle2,
  Trophy,
  BarChart3,
  PieChart as PieIcon,
  Calendar as CalendarIcon,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { occurrences, summary, isLoading, toggleOccurrence, deleteTask } = useDailyTasks();
  const {
    level,
    totalXp,
    currentLevelXp,
    nextLevelXp,
    progressPercentage,
  } = useGamification();
  const { dailyStreak, longestStreak } = useStreaks();

  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const {
    weekdayBreakdown,
    categoryDistribution,
    averageCompletionRate,
    totalTasksCompleted,
    totalTasksScheduled,
    bestStreak,
    topProductiveDay,
  } = useAnalytics(period);

  const { heatmap } = useHeatmap(period === '90d' ? 90 : 60);

  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
  const prevLevelRef = useRef<number | null>(null);

  // Trigger level-up modal if level goes up
  useEffect(() => {
    if (prevLevelRef.current !== null && level > prevLevelRef.current) {
      setIsLevelUpModalOpen(true);
    }
    prevLevelRef.current = level;
  }, [level]);

  return (
    <AppShell>
      <PageHeader
        title={`Welcome back, ${user?.name || user?.username || 'Adventurer'}! 👋`}
        subtitle="Here is your personal growth, daily habits, and productivity analytics for today."
      />

      {/* Gamification & Performance Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Daily Streak Card with Animated Flame */}
        <div className="glass p-4 rounded-2xl flex items-center justify-between border border-orange-500/20 bg-orange-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400">
              <Flame size={24} />
            </div>
            <div>
              <div className="text-fluid-xs text-orange-300 font-medium">Daily Streak</div>
              <div className="text-fluid-xl font-bold text-white flex items-center gap-2 mt-0.5">
                {dailyStreak} {dailyStreak === 1 ? 'Day' : 'Days'}
              </div>
            </div>
          </div>
          <StreakFlameBadge
            currentStreak={dailyStreak}
            longestStreak={longestStreak}
            size="md"
            showLabel={false}
          />
        </div>

        {/* Player Level Card */}
        <div className="glass p-4 rounded-2xl flex items-center justify-between border border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-500">
              <Zap size={24} />
            </div>
            <div>
              <div className="text-fluid-xs text-blue-400 font-medium">Player Rank</div>
              <div className="text-fluid-xl font-bold text-white mt-0.5">
                Level {level}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsLevelUpModalOpen(true)}
            title="Preview Level Celebration"
            className="text-[11px] px-2.5 py-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 font-medium transition-colors"
          >
            Milestone
          </button>
        </div>

        {/* Total XP Card with Link to Achievements */}
        <div className="glass p-4 rounded-2xl flex items-center justify-between border border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-400">
              <Award size={24} />
            </div>
            <div>
              <div className="text-fluid-xs text-yellow-300 font-medium">Total XP</div>
              <div className="text-fluid-xl font-bold text-white mt-0.5">
                {totalXp.toLocaleString()} XP
              </div>
            </div>
          </div>
          <Link
            to="/achievements"
            className="text-[11px] px-2.5 py-1 rounded-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 border border-yellow-400/30 font-medium transition-colors flex items-center gap-1"
          >
            <Trophy size={11} /> Badges
          </Link>
        </div>

        {/* Average Completion Rate Card */}
        <div className="glass p-4 rounded-2xl flex items-center justify-between border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-fluid-xs text-emerald-300 font-medium">Avg. Completion</div>
              <div className="text-fluid-xl font-bold text-white mt-0.5">
                {averageCompletionRate}%
              </div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold uppercase">
            {period}
          </span>
        </div>
      </div>

      {/* Level Progression Progress Bar */}
      <div className="mb-6">
        <LevelProgressBar
          level={level}
          currentLevelXp={currentLevelXp}
          nextLevelXp={nextLevelXp}
          progressPercentage={progressPercentage}
          totalXp={totalXp}
        />
      </div>

      {/* Main Grid: Daily Habits & Goals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {/* Daily Habits Dominates (2 cols on desktop) */}
        <div className="glass p-5 md:p-6 rounded-2xl md:col-span-2 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarCheck size={20} className="text-blue-500" />
              <h2 className="text-fluid-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                Today's Habits & Tasks
              </h2>
            </div>
            <Link
              to="/daily"
              className="text-fluid-xs text-blue-500 hover:text-blue-400 font-medium inline-flex items-center gap-1 transition-colors"
            >
              Manage Habits <ArrowRight size={13} />
            </Link>
          </div>

          {/* Quick Progress Indicator */}
          <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div className="text-fluid-xs text-zinc-300">
              <span className="font-semibold text-white">{summary.completedTasks}</span> of{' '}
              <span className="font-semibold text-white">{summary.totalTasks}</span> completed
            </div>
            <div className="text-fluid-xs font-bold text-blue-400">
              {summary.completionPercentage}% Done
            </div>
          </div>

          {/* Habit Items */}
          {isLoading ? (
            <div className="py-8 text-center text-zinc-400 text-fluid-sm">
              <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p>Loading habits...</p>
            </div>
          ) : occurrences.length > 0 ? (
            <div className="space-y-3">
              {occurrences.map((occ) => (
                <TaskItemCard
                  key={occ.id}
                  occurrence={occ}
                  onToggle={toggleOccurrence}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Sparkles size={28} className="mx-auto text-blue-500/60 mb-2" />
              <p className="text-fluid-sm text-zinc-400 mb-3">No habits scheduled for today yet.</p>
              <Link
                to="/daily"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-fluid-xs font-medium bg-blue-700/70 hover:bg-blue-700 text-white transition-all shadow-sm"
              >
                <Plus size={14} /> Add Your First Habit
              </Link>
            </div>
          )}
        </div>

        {/* Weekly & Monthly Overview Cards */}
        <div className="space-y-4">
          <div className="glass p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-fluid-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Weekly Plan
              </h3>
              <Link to="/weekly" className="text-fluid-xs text-blue-500 hover:underline">
                View
              </Link>
            </div>
            <p className="text-fluid-xs text-zinc-400 mb-3">
              Monday – Sunday planning cycle.
            </p>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-fluid-xs text-blue-400 font-medium">Cycle Status</div>
              <div className="text-fluid-lg font-bold text-white mt-0.5">Active Sprint</div>
              <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-400" /> Auto-rollover scheduled for Monday
              </div>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-fluid-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Monthly Goals
              </h3>
              <Link to="/monthly" className="text-fluid-xs text-blue-500 hover:underline">
                View
              </Link>
            </div>
            <p className="text-fluid-xs text-zinc-400 mb-3">Current month target overview.</p>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-fluid-xs text-emerald-300 font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <div className="text-fluid-lg font-bold text-white mt-0.5">Strategic Plan</div>
              <div className="text-[11px] text-zinc-400 mt-1">Track strategic targets for this cycle</div>
            </div>
          </div>
        </div>
      </div>

      {/* Integrated Productivity & Habit Analytics Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-500">
              <BarChart3 size={22} />
            </div>
            <div>
              <h2 className="text-fluid-xl font-bold" style={{ color: 'var(--color-text)' }}>
                Productivity & Performance Analytics
              </h2>
              <p className="text-fluid-xs text-zinc-400">
                Discover peak performance days, category distribution, and track habit consistency.
              </p>
            </div>
          </div>

          {/* Period Selector Tabs */}
          <div className="flex items-center p-1 rounded-2xl glass border border-white/10 self-start sm:self-auto shrink-0">
            {(['7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-fluid-xs font-semibold transition-all',
                  period === p
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Key Performance Indicators Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <p className="text-[11px] text-zinc-400 mt-1">Total habit check-ins in window</p>
          </div>

          <div className="glass p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-fluid-xs font-semibold uppercase tracking-wider text-blue-300">
                Peak Day
              </span>
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <CalendarIcon size={16} />
              </div>
            </div>
            <div className="text-fluid-2xl font-black text-white">{topProductiveDay}</div>
            <p className="text-[11px] text-zinc-400 mt-1">Highest consistency day of week</p>
          </div>

          <div className="glass p-4 rounded-2xl border border-orange-500/20 bg-orange-500/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-fluid-xs font-semibold uppercase tracking-wider text-orange-300">
                Record Streak
              </span>
              <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                <Flame size={16} />
              </div>
            </div>
            <div className="text-fluid-2xl font-black text-white">
              {bestStreak} Days 🔥
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">All-time personal best</p>
          </div>

          <div className="glass p-4 rounded-2xl border border-teal-500/20 bg-teal-500/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-fluid-xs font-semibold uppercase tracking-wider text-teal-300">
                Scheduled Volume
              </span>
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
                <Activity size={16} />
              </div>
            </div>
            <div className="text-fluid-2xl font-black text-white">
              {totalTasksScheduled}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Planned routine occurrences</p>
          </div>
        </div>

        {/* Charts Row: Day of Week Performance & Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="glass p-5 md:p-6 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-500" />
                <h3 className="text-fluid-base font-bold text-white">Day of Week Performance</h3>
              </div>
              <span className="text-fluid-xs text-zinc-400">Monday — Sunday</span>
            </div>
            <WeekdayBreakdownChart data={weekdayBreakdown} />
          </div>

          <div className="glass p-5 md:p-6 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieIcon size={18} className="text-emerald-400" />
                <h3 className="text-fluid-base font-bold text-white">Category Distribution</h3>
              </div>
            </div>
            <CategoryPieChart data={categoryDistribution} />
          </div>
        </div>

        {/* Consistency Calendar Heatmap */}
        <div className="glass p-5 md:p-6 rounded-3xl border border-white/10 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-amber-400" />
              <h3 className="text-fluid-base font-bold text-white">Consistency Calendar Heatmap</h3>
            </div>
            <span className="text-fluid-xs text-zinc-400">Density matrix</span>
          </div>
          <p className="text-fluid-xs text-zinc-400 mb-4 leading-relaxed">
            Every square represents a day of habit tracking. Darker shades indicate higher completion rates.
          </p>
          <CalendarHeatmap data={heatmap} />
        </div>
      </div>

      {/* Level-Up Celebration Modal */}
      <LevelUpModal
        isOpen={isLevelUpModalOpen}
        onClose={() => setIsLevelUpModalOpen(false)}
        newLevel={level}
        totalXp={totalXp}
      />
    </AppShell>
  );
};
