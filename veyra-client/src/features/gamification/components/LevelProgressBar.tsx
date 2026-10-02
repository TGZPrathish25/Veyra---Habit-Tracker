/** RPG-style Level Progress Bar with animated gradient fill and level badge. */
import React from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

interface LevelProgressBarProps {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercentage: number;
  totalXp?: number;
  compact?: boolean;
  className?: string;
}

export const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
  level,
  currentLevelXp,
  nextLevelXp,
  progressPercentage,
  totalXp,
  compact = false,
  className,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progressPercentage));

  if (compact) {
    return (
      <div className={cn('w-full flex items-center gap-3', className)}>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-fluid-xs shrink-0">
          <Shield size={12} className="text-purple-400" />
          <span>Lv. {level}</span>
        </div>
        <div className="flex-1">
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-700 ease-out relative"
              style={{ width: `${clampedProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
            </div>
          </div>
        </div>
        <span className="text-fluid-xs font-semibold text-zinc-400 shrink-0">
          {clampedProgress}%
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'glass p-4 md:p-5 rounded-2xl border border-white/10 relative overflow-hidden',
        className
      )}
    >
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Level Badge and XP status */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-fluid-base shadow-[0_0_15px_rgba(147,51,234,0.4)] border border-purple-300/30">
              {level}
            </div>
            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-zinc-900 border border-purple-400/50 text-purple-300">
              <Sparkles size={10} />
            </div>
          </div>
          <div>
            <div className="text-fluid-sm font-bold text-white flex items-center gap-1.5">
              Level {level} Adventurer
            </div>
            <div className="text-fluid-xs text-zinc-400">
              {totalXp !== undefined ? `${totalXp.toLocaleString()} Total XP` : `XP to Level ${level + 1}`}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-fluid-sm font-semibold text-purple-300">
            {currentLevelXp.toLocaleString()} / {nextLevelXp.toLocaleString()} <span className="text-fluid-xs text-zinc-400 font-normal">XP</span>
          </div>
          <div className="text-fluid-xs text-zinc-400 font-medium">
            {100 - clampedProgress}% remaining
          </div>
        </div>
      </div>

      {/* Sleek Progress Bar Track */}
      <div className="relative w-full h-3 rounded-full bg-zinc-900/80 border border-white/5 overflow-hidden p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(168,85,247,0.5)] relative"
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Shimmer sweep animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
};
