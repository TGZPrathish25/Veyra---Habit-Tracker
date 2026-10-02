/** Leaderboard ranking table for challenge participants. */
import React from 'react';
import { Medal, Trophy, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ChallengeParticipant } from '../types';

interface ChallengeLeaderboardProps {
  participants: ChallengeParticipant[];
  targetValue: number;
}

export const ChallengeLeaderboard: React.FC<ChallengeLeaderboardProps> = ({
  participants,
  targetValue,
}) => {
  if (participants.length === 0) {
    return (
      <div className="glass p-8 rounded-2xl border border-white/5 text-center text-zinc-400 text-fluid-sm">
        <Trophy size={36} className="mx-auto text-zinc-500 mb-2" />
        <p className="font-semibold text-white">No participants yet</p>
        <p className="text-fluid-xs text-zinc-400 mt-1">Be the first to join this challenge sprint!</p>
      </div>
    );
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold flex items-center justify-center text-fluid-xs">
          🥇
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-7 h-7 rounded-lg bg-zinc-300/20 border border-zinc-300/40 text-zinc-200 font-bold flex items-center justify-center text-fluid-xs">
          🥈
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-7 h-7 rounded-lg bg-amber-700/20 border border-amber-600/40 text-amber-500 font-bold flex items-center justify-center text-fluid-xs">
          🥉
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-lg bg-white/5 text-zinc-400 font-bold flex items-center justify-center text-fluid-xs">
        {rank}
      </div>
    );
  };

  return (
    <div className="space-y-2.5">
      {participants.map((p, index) => {
        const rank = index + 1;
        const pct = Math.min(100, Math.round((p.progress / targetValue) * 100));

        return (
          <div
            key={p.id}
            className={cn(
              'glass p-3.5 rounded-2xl border flex items-center justify-between gap-3 select-none transition-all',
              p.completed
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : rank === 1
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-white/5 hover:border-white/10'
            )}
          >
            {/* Rank + User Info */}
            <div className="flex items-center gap-3">
              {getRankBadge(rank)}

              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-fluid-xs">
                {p.userName.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="font-bold text-white text-fluid-xs flex items-center gap-1.5">
                  <span>{p.userName}</span>
                  {p.completed && (
                    <span className="text-emerald-400 flex items-center gap-0.5 text-[10px] font-semibold">
                      <CheckCircle2 size={11} /> Finished
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <span className="text-blue-400 flex items-center gap-0.5">
                    <Zap size={10} /> Lv. {p.userLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar & Value */}
            <div className="flex items-center gap-3 text-right">
              <div className="w-24 sm:w-32 hidden sm:block">
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      p.completed ? 'bg-emerald-400' : 'bg-blue-500'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="font-bold text-white text-fluid-xs">
                  {p.progress} / {targetValue}
                </div>
                <div className="text-[10px] text-zinc-400 font-semibold">{pct}%</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
