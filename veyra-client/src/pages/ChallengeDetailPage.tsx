/** Single challenge sprint detail view with progress logging and live participant leaderboard. */
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { GlassButton } from '@/components/glass/GlassButton';
import {
  useChallenge,
  useChallenges,
  ChallengeLeaderboard,
} from '@/features/challenges';
import {
  Trophy,
  ArrowLeft,
  Calendar,
  Users,
  Sparkles,
  Flame,
  CheckCircle2,
  Plus,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export const ChallengeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { challenge, participants, isLoading, updateProgress, isUpdating } = useChallenge(id);
  const { joinChallenge, leaveChallenge } = useChallenges();

  if (isLoading) {
    return (
      <AppShell>
        <div className="py-16 text-center text-zinc-400">
          <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-fluid-sm">Loading challenge sprint...</p>
        </div>
      </AppShell>
    );
  }

  if (!challenge) {
    return (
      <AppShell>
        <div className="glass p-12 rounded-3xl border border-white/5 text-center">
          <Trophy size={48} className="mx-auto text-zinc-600 mb-3" />
          <h2 className="text-fluid-lg font-bold text-white mb-2">Challenge Not Found</h2>
          <p className="text-fluid-xs text-zinc-400 mb-4">
            This challenge sprint might have been concluded or removed.
          </p>
          <Link
            to="/challenges"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-fluid-xs font-semibold bg-blue-700 text-white"
          >
            <ArrowLeft size={14} /> Back to Challenges
          </Link>
        </div>
      </AppShell>
    );
  }

  const userProgress = challenge.userProgress ?? 0;
  const progressPercentage = Math.min(
    100,
    Math.round((userProgress / challenge.targetValue) * 100)
  );

  const handleIncrement = async () => {
    await updateProgress({ increment: 1 });
  };

  const handleJoin = async () => {
    if (id) await joinChallenge(id);
  };

  const handleLeave = async () => {
    if (id && window.confirm('Are you sure you want to leave this challenge?')) {
      await leaveChallenge(id);
    }
  };

  return (
    <AppShell>
      {/* Back Button */}
      <div className="mb-4">
        <Link
          to="/challenges"
          className="inline-flex items-center gap-1.5 text-fluid-xs text-zinc-400 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors"
        >
          <ArrowLeft size={14} />
          <span>All Challenges</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                <Trophy size={11} />
                <span>{challenge.type === 'daily_streak' ? 'Streak Challenge' : 'Habit Challenge'}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Sparkles size={11} />
                <span>+{challenge.rewardXp} XP Reward</span>
              </span>
            </div>

            <h1 className="text-fluid-2xl font-black text-white tracking-tight mb-2">
              {challenge.title}
            </h1>
            {challenge.description && (
              <p className="text-fluid-sm text-zinc-300 max-w-2xl leading-relaxed mb-4">
                {challenge.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-fluid-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-zinc-500" />
                {challenge.startDate} to {challenge.endDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={13} className="text-zinc-500" />
                {challenge.participantCount} challengers enrolled
              </span>
              <span>•</span>
              <span>Created by <strong className="text-white">{challenge.creatorName}</strong></span>
            </div>
          </div>

          {/* Action Button: Join or Leave */}
          <div>
            {!challenge.isJoined ? (
              <GlassButton
                variant="primary"
                onClick={handleJoin}
                className="font-bold text-fluid-xs px-5 py-2.5 gap-2"
              >
                <Trophy size={15} />
                <span>Join Challenge</span>
              </GlassButton>
            ) : (
              <button
                onClick={handleLeave}
                className="px-3 py-1.5 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-fluid-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <LogOut size={13} />
                <span>Leave Sprint</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Your Progress Tracker (If Joined) */}
      {challenge.isJoined && (
        <div className="glass p-6 rounded-3xl border border-blue-500/30 bg-blue-500/5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="text-fluid-xs font-bold uppercase tracking-wider text-blue-400 mb-0.5">
                Your Sprint Progress
              </div>
              <div className="text-fluid-xl font-extrabold text-white">
                {userProgress} of {challenge.targetValue}{' '}
                <span className="text-fluid-sm font-normal text-zinc-400">
                  {challenge.type === 'daily_streak' ? 'days completed' : 'habits logged'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <GlassButton
                variant="primary"
                onClick={handleIncrement}
                disabled={isUpdating || challenge.isCompleted}
                className="text-fluid-xs font-bold gap-1.5 px-4 py-2"
              >
                <Plus size={14} />
                <span>Log Progress (+1)</span>
              </GlassButton>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden relative mb-2">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700 ease-out relative',
                challenge.isCompleted
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-400 shadow-[0_0_12px_rgba(0,119,204,0.5)]'
              )}
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-between text-fluid-xs text-zinc-400">
            <span>{progressPercentage}% Completed</span>
            {challenge.isCompleted ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} /> Target Achieved! +{challenge.rewardXp} XP Awarded!
              </span>
            ) : (
              <span>{challenge.targetValue - userProgress} left to target</span>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Section */}
      <div className="glass p-6 md:p-8 rounded-3xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <h2 className="text-fluid-lg font-bold text-white">Challenger Leaderboard</h2>
          </div>
          <span className="text-fluid-xs text-zinc-400">
            {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
          </span>
        </div>

        <ChallengeLeaderboard
          participants={participants}
          targetValue={challenge.targetValue}
        />
      </div>
    </AppShell>
  );
};
