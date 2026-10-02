/** Challenge card component displaying sprint details, progress bar, and join action. */
import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Flame, CheckCircle2, Users, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Challenge } from '../types';

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin?: (id: string) => Promise<unknown>;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onJoin }) => {
  const {
    id,
    title,
    description,
    type,
    targetValue,
    rewardXp,
    startDate,
    endDate,
    participantCount,
    isJoined,
    userProgress = 0,
    isCompleted,
  } = challenge;

  const progressPercentage = Math.min(100, Math.round((userProgress / targetValue) * 100));

  const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    daily_streak: {
      label: 'Daily Streak',
      icon: <Flame size={12} className="text-orange-400" />,
      color: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    },
    task_count: {
      label: 'Habit Count',
      icon: <CheckCircle2 size={12} className="text-emerald-400" />,
      color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    },
    custom: {
      label: 'Custom Sprint',
      icon: <Trophy size={12} className="text-purple-400" />,
      color: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    },
  };

  const currentType = typeConfig[type] || typeConfig.custom;

  return (
    <div className="glass p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between select-none relative group">
      <div>
        {/* Top Badges: Type + Reward XP */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={cn(
              'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5',
              currentType.color
            )}
          >
            {currentType.icon}
            <span>{currentType.label}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-fluid-xs font-bold shadow-sm">
            <Sparkles size={11} className="text-amber-400" />
            +{rewardXp} XP
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-fluid-base font-bold text-white group-hover:text-purple-200 transition-colors mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-fluid-xs text-zinc-400 leading-relaxed line-clamp-2 mb-4">
            {description}
          </p>
        )}

        {/* Metadata: Dates & Participants */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-4 pb-3 border-b border-white/5">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-zinc-500" />
            {startDate} to {endDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={12} className="text-zinc-500" />
            {participantCount} {participantCount === 1 ? 'challenger' : 'challengers'}
          </span>
        </div>

        {/* If user has joined, show active progress bar */}
        {isJoined && (
          <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-between text-fluid-xs mb-1.5">
              <span className="font-semibold text-zinc-300">Your Progress</span>
              <span className="font-bold text-purple-300">
                {userProgress} / {targetValue}{' '}
                <span className="text-[10px] text-zinc-400">({progressPercentage}%)</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            {isCompleted && (
              <div className="text-[11px] text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                <CheckCircle2 size={12} /> Target Completed!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-2">
        <Link
          to={`/challenges/${id}`}
          className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 text-fluid-xs font-semibold transition-all flex items-center justify-center gap-1"
        >
          <span>View Leaderboard</span>
          <ArrowRight size={13} />
        </Link>

        {!isJoined && onJoin && (
          <button
            onClick={() => onJoin(id)}
            className="py-2 px-4 rounded-xl bg-purple-600/70 hover:bg-purple-600 text-white font-bold text-fluid-xs transition-all shadow-sm flex items-center gap-1.5"
          >
            <Trophy size={13} />
            <span>Join</span>
          </button>
        )}
      </div>
    </div>
  );
};
