/** Achievements gallery with unlocked badges, category filters, and XP milestones. */
import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  useAchievements,
  useGamification,
  AchievementCard,
  LevelProgressBar,
  StreakFlameBadge,
  type AchievementCategory,
} from '@/features/gamification';
import { Trophy, Award, Sparkles, Filter, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/cn';

const CATEGORIES: { id: AchievementCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Badges' },
  { id: 'streaks', label: 'Streaks' },
  { id: 'tasks', label: 'Habits' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'social', label: 'Social' },
];

export const AchievementsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const {
    achievements,
    unlockedCount,
    totalCount,
    completionPercentage,
    unlockedXp,
    isLoading,
  } = useAchievements(selectedCategory);

  const { level, currentLevelXp, nextLevelXp, progressPercentage, totalXp } = useGamification();

  return (
    <AppShell>
      <PageHeader
        title="Achievements & Trophies"
        subtitle="Earn badges, collect bonus XP, and immortalize your consistency milestones."
      />

      {/* Top Gamification Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Unlocked Trophies Count */}
        <div className="glass p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
          <div>
            <div className="text-fluid-xs font-semibold uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1.5">
              <Trophy size={14} />
              <span>Badges Unlocked</span>
            </div>
            <div className="text-fluid-2xl font-black text-white">
              {unlockedCount} <span className="text-fluid-base font-normal text-zinc-400">/ {totalCount}</span>
            </div>
            <div className="text-fluid-xs text-zinc-400 mt-1">
              {completionPercentage}% completed
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award size={32} />
          </div>
        </div>

        {/* Bonus XP Earned */}
        <div className="glass p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-between">
          <div>
            <div className="text-fluid-xs font-semibold uppercase tracking-wider text-blue-400 mb-1 flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Achievement XP</span>
            </div>
            <div className="text-fluid-2xl font-black text-blue-300">
              +{unlockedXp.toLocaleString()} <span className="text-fluid-base font-normal text-zinc-400">XP</span>
            </div>
            <div className="text-fluid-xs text-zinc-400 mt-1">
              Boosted your player level
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <Sparkles size={32} />
          </div>
        </div>

        {/* Player Status & Level Bar Preview */}
        <div className="glass p-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 flex flex-col justify-center">
          <div className="text-fluid-xs font-semibold uppercase tracking-wider text-cyan-300 mb-2 flex items-center justify-between">
            <span>Current Standing</span>
            <span className="text-white font-bold">Level {level}</span>
          </div>
          <LevelProgressBar
            level={level}
            currentLevelXp={currentLevelXp}
            nextLevelXp={nextLevelXp}
            progressPercentage={progressPercentage}
            compact
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-fluid-xs font-semibold whitespace-nowrap transition-all duration-200 border',
                active
                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'glass text-zinc-400 border-white/5 hover:text-gray-900 dark:hover:text-white hover:border-white/20'
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Achievements Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass p-5 rounded-2xl border border-white/5 h-44 animate-pulse" />
          ))}
        </div>
      ) : achievements.length === 0 ? (
        <div className="glass p-12 rounded-3xl border border-white/5 text-center">
          <Trophy size={48} className="mx-auto text-zinc-600 mb-3" />
          <h3 className="text-fluid-lg font-bold text-white mb-1">No achievements found</h3>
          <p className="text-fluid-xs text-zinc-400">Try selecting another category or complete more habits to unlock badges.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id || achievement.key} achievement={achievement} />
          ))}
        </div>
      )}
    </AppShell>
  );
};
