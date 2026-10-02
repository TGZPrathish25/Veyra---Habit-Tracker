/** Modal displaying friend's daily habit progress with 4-tier privacy level masking. */
import React from 'react';
import { GlassButton } from '@/components/glass/GlassButton';
import { useFriendProgress } from '../hooks/useFriends';
import { Shield, CheckCircle2, Clock, Flame, Zap, Award, X, Lock } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { PrivacyLevel } from '../types';

interface FriendProgressModalProps {
  friendId: string | null;
  onClose: () => void;
}

const PRIVACY_EXPLANATION: Record<
  PrivacyLevel,
  { title: string; desc: string; badge: string }
> = {
  basic: {
    title: 'Level 1: Completion Percentage Only',
    desc: 'This friend shares only their overall daily completion rate. Specific task names and counts are private.',
    badge: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  },
  counts: {
    title: 'Level 2: Task Counts & Rate',
    desc: 'This friend shares their completion count and overall percentage. Specific habit titles remain private.',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  detailed: {
    title: 'Level 3: Habit Titles & Status',
    desc: 'This friend shares habit titles, emojis, and completion status. Detailed notes and timestamps remain private.',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  full: {
    title: 'Level 4: Full Accountability Profile',
    desc: 'This friend shares complete habit details, streaks, completion timestamps, and level status.',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
};

export const FriendProgressModal: React.FC<FriendProgressModalProps> = ({ friendId, onClose }) => {
  const { data: progress, isLoading, isError } = useFriendProgress(friendId);

  if (!friendId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div
        className="glass-heavy relative z-10 w-full max-w-lg p-6 rounded-3xl border border-white/15 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-purple-400/40 flex items-center justify-center text-white font-bold text-fluid-lg shadow-sm">
              {progress?.name ? progress.name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div>
              <h2 className="text-fluid-lg font-bold text-white">
                {progress?.name || progress?.username || 'Friend'}'s Accountability
              </h2>
              <p className="text-fluid-xs text-zinc-400">@{progress?.username || 'user'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-zinc-400">
            <div className="inline-block w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-fluid-sm">Loading friend's accountability view...</p>
          </div>
        ) : isError || !progress ? (
          <div className="py-8 text-center text-rose-300">
            <p>Could not load friend progress.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Privacy Level Explanation Badge */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Shield size={13} className="text-purple-400" />
                  Active Privacy Level
                </span>
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                    PRIVACY_EXPLANATION[progress.privacyLevel].badge
                  )}
                >
                  {PRIVACY_EXPLANATION[progress.privacyLevel].title}
                </span>
              </div>
              <p className="text-fluid-xs text-zinc-400 leading-relaxed">
                {PRIVACY_EXPLANATION[progress.privacyLevel].desc}
              </p>
            </div>

            {/* Completion Percentage Progress Meter */}
            <div className="glass p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-fluid-xs text-zinc-400 font-medium">Daily Completion Rate</div>
                <div className="text-fluid-2xl font-black text-white mt-0.5">
                  {progress.completionPercentage}%
                </div>
                {progress.completedTasks !== undefined && progress.totalTasks !== undefined && (
                  <div className="text-fluid-xs text-purple-300 mt-1">
                    {progress.completedTasks} of {progress.totalTasks} habits finished
                  </div>
                )}
              </div>

              {/* Visual Ring or Pill */}
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center justify-center text-purple-300 font-bold">
                <span className="text-fluid-base">{progress.completionPercentage}%</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400">Done</span>
              </div>
            </div>

            {/* Level 3 & Level 4: Task List */}
            {progress.tasks && progress.tasks.length > 0 ? (
              <div className="space-y-2">
                <div className="text-fluid-xs font-semibold uppercase tracking-wider text-zinc-400 px-1">
                  Today's Habits ({progress.tasks.length})
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {progress.tasks.map((task, idx) => (
                    <div
                      key={task.id || idx}
                      className={cn(
                        'p-3 rounded-xl border flex items-center justify-between text-fluid-xs',
                        task.completed
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                          : 'bg-white/5 border-white/5 text-zinc-300'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-fluid-base">{task.emoji || '✨'}</span>
                        <div>
                          <span className={cn('font-semibold', task.completed && 'line-through opacity-85')}>
                            {task.title}
                          </span>
                          {task.description && (
                            <p className="text-[10px] text-zinc-400">{task.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {task.completed ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                            <CheckCircle2 size={13} /> Completed
                          </span>
                        ) : (
                          <span className="text-zinc-500 flex items-center gap-1 text-[11px]">
                            <Clock size={13} /> Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : progress.privacyLevel === 'basic' || progress.privacyLevel === 'counts' ? (
              /* Privacy placeholder note */
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-fluid-xs text-zinc-400 flex flex-col items-center gap-1">
                <Lock size={18} className="text-zinc-500 mb-1" />
                <span>Task names are kept private according to friend's privacy preferences.</span>
              </div>
            ) : null}

            {/* Level 4 Stats: Streak & XP */}
            {progress.currentStreak !== undefined && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
                  <Flame size={16} className="text-orange-400" />
                  <div>
                    <div className="text-[10px] text-orange-300 uppercase font-semibold">Active Streak</div>
                    <div className="text-fluid-sm font-bold text-white">{progress.currentStreak} Days 🔥</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
                  <Award size={16} className="text-yellow-400" />
                  <div>
                    <div className="text-[10px] text-yellow-300 uppercase font-semibold">Total XP</div>
                    <div className="text-fluid-sm font-bold text-white">{progress.totalXp?.toLocaleString()} XP</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-5">
          <GlassButton variant="ghost" onClick={onClose} className="w-full justify-center text-fluid-xs">
            Close
          </GlassButton>
        </div>
      </div>
    </div>
  );
};
