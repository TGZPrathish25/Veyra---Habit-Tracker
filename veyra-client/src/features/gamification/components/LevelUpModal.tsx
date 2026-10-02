/** Level-up celebration modal with animated perks and particle sparkles. */
import React, { useEffect } from 'react';
import { GlassButton } from '@/components/glass/GlassButton';
import { Sparkles, Trophy, Star, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { playLevelUpFanfare } from '@/lib/sound';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  totalXp?: number;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  newLevel,
  totalXp,
}) => {
  useEffect(() => {
    if (isOpen) {
      playLevelUpFanfare();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="glass-heavy relative z-10 w-full max-w-md p-6 md:p-8 rounded-3xl border border-amber-500/30 text-center shadow-[0_0_50px_rgba(245,158,11,0.3)] animate-in fade-in zoom-in-95 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Sparks */}
        <div className="flex justify-center mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-fluid-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles size={14} className="animate-spin text-amber-400" />
            <span>Milestone Reached!</span>
          </div>
        </div>

        {/* Level Emblem */}
        <div className="relative my-4 inline-block">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-300 p-1 shadow-[0_0_35px_rgba(251,191,36,0.6)] animate-bounce">
            <div className="w-full h-full rounded-[22px] bg-zinc-950 flex flex-col items-center justify-center border border-amber-300/40">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Level</span>
              <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
                {newLevel}
              </span>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-amber-400 text-black shadow-lg">
            <Trophy size={16} />
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-fluid-2xl font-black text-white tracking-tight mb-2">
          LEVEL UP!
        </h2>
        <p className="text-fluid-sm text-zinc-300 mb-6">
          Outstanding work! Your discipline and consistency have unlocked Level {newLevel}.
          Keep crushing your goals!
        </p>

        {/* Perks / Rewards Unlocked */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left mb-6 space-y-2.5">
          <div className="text-fluid-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Star size={13} />
            <span>Rewards & Perks Unlocked</span>
          </div>
          <div className="flex items-center justify-between text-fluid-xs text-zinc-200">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Next tier leaderboard eligibility
            </span>
            <span className="text-emerald-400 font-bold">Active</span>
          </div>
          <div className="flex items-center justify-between text-fluid-xs text-zinc-200">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Level {newLevel} profile badge
            </span>
            <span className="text-emerald-400 font-bold">Equipped</span>
          </div>
          {totalXp !== undefined && (
            <div className="flex items-center justify-between text-fluid-xs text-zinc-200">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Total XP Accumulated
              </span>
              <span className="text-blue-400 font-bold">{totalXp.toLocaleString()} XP</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <GlassButton
          variant="primary"
          onClick={onClose}
          className="w-full justify-center text-fluid-sm py-3 font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 border-amber-300/40 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]"
        >
          Claim & Continue
        </GlassButton>
      </div>
    </div>
  );
};
