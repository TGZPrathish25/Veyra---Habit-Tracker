/** Interactive card displaying an achievement with unlocked/locked states. */
import React from 'react';
import { Lock, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Achievement } from '../types';

interface AchievementCardProps {
  achievement: Achievement;
  onClick?: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onClick }) => {
  const { title, description, icon, xpReward, category, unlocked, unlockedAt } = achievement;

  const formattedDate = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const categoryLabels: Record<string, string> = {
    streaks: 'Streaks',
    tasks: 'Habits',
    milestones: 'Milestone',
    social: 'Social',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative p-4 md:p-5 rounded-2xl transition-all duration-300 border flex flex-col justify-between select-none',
        unlocked
          ? 'glass bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent border-amber-500/30 hover:border-amber-400/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:-translate-y-0.5'
          : 'glass bg-white/[0.02] border-white/5 opacity-65 hover:opacity-85 hover:border-white/10'
      )}
    >
      {/* Top Header: Icon + Category + Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="relative">
          <div
            className={cn(
              'w-13 h-13 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110',
              unlocked
                ? 'bg-amber-500/20 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-white/5 border border-white/10 grayscale'
            )}
          >
            {icon}
          </div>
          {unlocked && (
            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-black border-2 border-zinc-900 shadow">
              <CheckCircle2 size={12} strokeWidth={3} />
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5">
            {categoryLabels[category] || category}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 text-fluid-xs font-semibold px-2 py-0.5 rounded-full border',
              unlocked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-white/5 text-zinc-400 border-white/5'
            )}
          >
            <Sparkles size={11} className={unlocked ? 'text-amber-400' : 'text-zinc-500'} />
            +{xpReward} XP
          </span>
        </div>
      </div>

      {/* Body: Title & Description */}
      <div>
        <h3
          className={cn(
            'text-fluid-sm font-bold tracking-tight mb-1 transition-colors',
            unlocked ? 'text-white group-hover:text-amber-200' : 'text-zinc-300'
          )}
        >
          {title}
        </h3>
        <p className="text-fluid-xs text-zinc-400 leading-relaxed mb-3 line-clamp-2">
          {description}
        </p>
      </div>

      {/* Footer: Date or Locked Status */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
        {unlocked ? (
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <Award size={12} />
            {formattedDate ? `Unlocked ${formattedDate}` : 'Unlocked'}
          </span>
        ) : (
          <span className="text-zinc-500 font-medium flex items-center gap-1">
            <Lock size={12} />
            Locked
          </span>
        )}
      </div>
    </div>
  );
};
