/**
 * FriendProfilePage — Dedicated full-page friend accountability profile with privacy-level masking.
 */
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassButton } from '@/components/glass/GlassButton';
import { useFriendProgress } from '@/features/friends/hooks/useFriends';
import { Shield, CheckCircle2, Clock, Flame, Zap, Award, ArrowLeft, Lock } from 'lucide-react';
import type { PrivacyLevel } from '@/features/friends/types';

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

export const FriendProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: progress, isLoading, isError } = useFriendProgress(id || null);

  const privacyMeta = progress
    ? PRIVACY_EXPLANATION[progress.privacyLevel]
    : PRIVACY_EXPLANATION.basic;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/friends"
          className="inline-flex items-center gap-2 text-fluid-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Friends</span>
        </Link>

        {isLoading ? (
          <div className="glass p-12 text-center rounded-2xl animate-pulse">
            <p className="text-fluid-sm text-zinc-400">Loading friend accountability profile...</p>
          </div>
        ) : isError || !progress ? (
          <div className="glass p-12 text-center rounded-2xl border border-rose-500/20">
            <h3 className="text-fluid-base font-bold text-white mb-2">Friend Profile Unavailable</h3>
            <p className="text-fluid-xs text-zinc-400 mb-4">
              Unable to load accountability telemetry for this user.
            </p>
            <Link to="/friends">
              <GlassButton variant="secondary" size="sm">
                Return to Friends List
              </GlassButton>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-purple-400/40 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {progress.name ? progress.name.charAt(0).toUpperCase() : 'F'}
                </div>
                <div>
                  <h1 className="text-fluid-xl font-bold text-white">{progress.name}</h1>
                  <p className="text-fluid-xs text-zinc-400">@{progress.username}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold">
                    <Shield size={12} />
                    <span>{privacyMeta.title}</span>
                  </div>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-3">
                <div className="px-4 py-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-400 text-xs font-bold mb-0.5">
                    <Flame size={14} />
                    <span>Streak</span>
                  </div>
                  <div className="text-fluid-lg font-extrabold text-white">
                    {progress.currentStreak}d
                  </div>
                </div>

                <div className="px-4 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-400 text-xs font-bold mb-0.5">
                    <Zap size={14} />
                    <span>Level</span>
                  </div>
                  <div className="text-fluid-lg font-extrabold text-white">
                    {progress.level}
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Explanation Banner */}
            <div className="glass p-4 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center gap-3">
              <Shield size={18} className="text-purple-400 flex-shrink-0" />
              <p className="text-fluid-xs text-zinc-300">{privacyMeta.desc}</p>
            </div>

            {/* Habits & Occurrences Checklist */}
            <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-fluid-base font-bold text-white">Daily Habit Progress</h3>
                <span className="text-fluid-xs font-bold text-purple-300">
                  {progress.completionPercentage}% Completed
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-black/40 overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-purple-500 to-indigo-400"
                  style={{ width: `${progress.completionPercentage}%` }}
                />
              </div>

              {progress.privacyLevel === 'basic' && (
                <div className="p-6 text-center rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <Lock size={24} className="mx-auto text-zinc-500" />
                  <p className="text-fluid-xs text-zinc-400">
                    Individual habit names and counts are masked under Level 1 privacy.
                  </p>
                </div>
              )}

              {progress.privacyLevel === 'counts' && (
                <div className="p-6 text-center rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <p className="text-fluid-lg font-bold text-white">
                    {progress.completedTasks || 0} of {progress.totalTasks || 0} Tasks Done Today
                  </p>
                  <p className="text-fluid-xs text-zinc-400">
                    Specific task titles are masked under Level 2 privacy.
                  </p>
                </div>
              )}

              {(progress.privacyLevel === 'detailed' || progress.privacyLevel === 'full') && (
                <div className="space-y-2">
                  {progress.tasks?.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-fluid-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            task.completed
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-zinc-700/50 text-zinc-500'
                          }`}
                        >
                          <CheckCircle2 size={13} />
                        </div>
                        <span className={task.completed ? 'line-through text-zinc-400' : 'text-white'}>
                          {task.title}
                        </span>
                      </div>
                      {task.completedAt && (
                        <span className="text-[10px] text-zinc-500">
                          {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
