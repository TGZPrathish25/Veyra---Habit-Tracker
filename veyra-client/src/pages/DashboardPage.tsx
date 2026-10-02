/** Main dashboard with live daily habits, gamification stats, and progress overview. */
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
  Flame,
  Zap,
  Award,
  CalendarCheck,
  ArrowRight,
  Plus,
  Sparkles,
  CheckCircle2,
  Trophy,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { occurrences, summary, isLoading, toggleOccurrence } = useDailyTasks();
  const {
    level,
    totalXp,
    currentLevelXp,
    nextLevelXp,
    progressPercentage,
  } = useGamification();
  const { dailyStreak, longestStreak } = useStreaks();

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
        subtitle="Here is your personal growth, productivity, and leveling progress for today."
      />

      {/* Gamification Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
        <div className="glass p-4 rounded-2xl flex items-center justify-between border border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
              <Zap size={24} />
            </div>
            <div>
              <div className="text-fluid-xs text-purple-300 font-medium">Player Rank</div>
              <div className="text-fluid-xl font-bold text-white mt-0.5">
                Level {level}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsLevelUpModalOpen(true)}
            title="Preview Level Celebration"
            className="text-[11px] px-2.5 py-1 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 font-medium transition-colors"
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

      {/* Main Grid Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Daily Habits Dominates (2 cols on desktop) */}
        <div className="glass p-5 md:p-6 rounded-2xl md:col-span-2 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarCheck size={20} className="text-purple-400" />
              <h2 className="text-fluid-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                Today's Habits & Tasks
              </h2>
            </div>
            <Link
              to="/daily"
              className="text-fluid-xs text-purple-400 hover:text-purple-300 font-medium inline-flex items-center gap-1 transition-colors"
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
            <div className="text-fluid-xs font-bold text-purple-300">
              {summary.completionPercentage}% Done
            </div>
          </div>

          {/* Habit Items */}
          {isLoading ? (
            <div className="py-8 text-center text-zinc-400 text-fluid-sm">
              <div className="inline-block w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-2" />
              <p>Loading habits...</p>
            </div>
          ) : occurrences.length > 0 ? (
            <div className="space-y-3">
              {occurrences.map((occ) => (
                <TaskItemCard
                  key={occ.id}
                  occurrence={occ}
                  onToggle={toggleOccurrence}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Sparkles size={28} className="mx-auto text-purple-400/60 mb-2" />
              <p className="text-fluid-sm text-zinc-400 mb-3">No habits scheduled for today yet.</p>
              <Link
                to="/daily"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-fluid-xs font-medium bg-purple-600/70 hover:bg-purple-600 text-white transition-all shadow-sm"
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
              <Link to="/weekly" className="text-fluid-xs text-purple-400 hover:underline">
                View
              </Link>
            </div>
            <p className="text-fluid-xs text-zinc-400 mb-3">
              Monday – Sunday planning cycle.
            </p>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-fluid-xs text-purple-300 font-medium">Cycle Status</div>
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
              <Link to="/monthly" className="text-fluid-xs text-purple-400 hover:underline">
                View
              </Link>
            </div>
            <p className="text-fluid-xs text-zinc-400 mb-3">Current month target overview.</p>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-fluid-xs text-emerald-300 font-medium">October 2026</div>
              <div className="text-fluid-lg font-bold text-white mt-0.5">Focus: Consistency</div>
              <div className="text-[11px] text-zinc-400 mt-1">Locks on Oct 31 into permanent history</div>
            </div>
          </div>
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
