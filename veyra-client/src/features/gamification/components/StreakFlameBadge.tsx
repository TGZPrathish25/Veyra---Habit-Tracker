/** Vibrant glowing flame badge showing daily streak momentum. */
import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/cn';

interface StreakFlameBadgeProps {
  currentStreak: number;
  longestStreak?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const StreakFlameBadge: React.FC<StreakFlameBadgeProps> = ({
  currentStreak,
  longestStreak = 0,
  size = 'md',
  showLabel = true,
  className,
}) => {
  const isLegendary = currentStreak >= 14;
  const isSuper = currentStreak >= 7;
  const isActive = currentStreak > 0;

  const sizeClasses = {
    sm: 'px-2 py-1 text-fluid-xs gap-1.5',
    md: 'px-3 py-1.5 text-fluid-sm gap-2',
    lg: 'px-4 py-2.5 text-fluid-base gap-2.5',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center rounded-full font-semibold transition-all duration-300 border select-none group',
        sizeClasses[size],
        isActive
          ? isLegendary
            ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-rose-500/20 border-amber-400/50 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
            : isSuper
            ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/40 text-orange-200 shadow-[0_0_12px_rgba(249,115,22,0.25)]'
            : 'bg-orange-500/10 border-orange-500/30 text-orange-300'
          : 'bg-white/5 border-white/10 text-zinc-400',
        className
      )}
      title={
        longestStreak > 0
          ? `Current streak: ${currentStreak} days | Personal best: ${longestStreak} days`
          : `Current streak: ${currentStreak} days`
      }
    >
      {/* Background Pulse for Active Streaks */}
      {isActive && (
        <span
          className={cn(
            'absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none',
            isLegendary ? 'bg-amber-400' : isSuper ? 'bg-orange-500' : 'bg-orange-400'
          )}
        />
      )}

      {/* Flame Icon with Micro-Animation */}
      <span
        className={cn(
          'transition-transform duration-300 group-hover:scale-110 flex items-center justify-center',
          isActive
            ? isLegendary
              ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse'
              : isSuper
              ? 'text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]'
              : 'text-orange-400'
            : 'text-zinc-500'
        )}
      >
        <Flame
          size={iconSizes[size]}
          className={isActive ? 'fill-current' : 'fill-none'}
        />
      </span>

      {/* Streak Number & Label */}
      <span className="font-bold tracking-tight">
        {currentStreak}
        {showLabel && (
          <span className="ml-1 font-normal opacity-90">
            {currentStreak === 1 ? 'day' : 'days'}
          </span>
        )}
      </span>

      {/* Longest streak pill on large mode */}
      {size === 'lg' && longestStreak > 0 && (
        <span className="text-fluid-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-normal ml-1">
          Best: {longestStreak}d
        </span>
      )}
    </div>
  );
};
