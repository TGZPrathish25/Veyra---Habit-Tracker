/** Challenges directory page — sprint exploration, status filters, and challenge creation. */
import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassButton } from '@/components/glass/GlassButton';
import {
  useChallenges,
  ChallengeCard,
  CreateChallengeModal,
} from '@/features/challenges';
import { Trophy, Plus, Flame, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type FilterType = 'all' | 'active' | 'my';

export const ChallengesPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { challenges, isLoading, createChallenge, joinChallenge } = useChallenges(filter);

  const myJoinedCount = challenges.filter((c) => c.isJoined).length;
  const totalRewardXp = challenges.reduce((sum, c) => sum + c.rewardXp, 0);

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <PageHeader
          title="Goal Sprints & Challenges"
          subtitle="Compete with friends, maintain daily streaks, and claim bonus XP together."
        />
        <GlassButton
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="self-start sm:self-auto text-fluid-xs font-bold gap-1.5 shrink-0"
        >
          <Plus size={15} />
          <span>Create Challenge</span>
        </GlassButton>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 flex items-center justify-between">
          <div>
            <div className="text-fluid-xs font-semibold uppercase tracking-wider text-purple-300">
              Active Challenges
            </div>
            <div className="text-fluid-2xl font-black text-white mt-0.5">
              {challenges.length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Trophy size={24} />
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
          <div>
            <div className="text-fluid-xs font-semibold uppercase tracking-wider text-emerald-300">
              Joined Sprints
            </div>
            <div className="text-fluid-2xl font-black text-white mt-0.5">
              {myJoinedCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
          <div>
            <div className="text-fluid-xs font-semibold uppercase tracking-wider text-amber-300">
              Reward XP Pool
            </div>
            <div className="text-fluid-2xl font-black text-white mt-0.5">
              +{totalRewardXp.toLocaleString()} XP
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles size={24} />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6">
        {[
          { id: 'all', label: 'All Challenges' },
          { id: 'active', label: 'Active Sprints' },
          { id: 'my', label: 'My Challenges' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as FilterType)}
            className={cn(
              'px-4 py-2 rounded-xl text-fluid-xs font-semibold transition-all border',
              filter === tab.id
                ? 'bg-purple-500/20 text-purple-200 border-purple-400/40 shadow-sm'
                : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/5'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass p-5 rounded-2xl border border-white/5 h-64 animate-pulse" />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="glass p-12 rounded-3xl border border-white/5 text-center">
          <Trophy size={48} className="mx-auto text-zinc-600 mb-3" />
          <h3 className="text-fluid-lg font-bold text-white mb-1">No challenges found</h3>
          <p className="text-fluid-xs text-zinc-400 mb-4">
            {filter === 'my'
              ? 'You have not joined any challenges yet. Browse active challenges to participate!'
              : 'Create a challenge to rally your friends for a habit sprint.'}
          </p>
          <GlassButton variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={14} className="mr-1.5" /> Launch First Challenge
          </GlassButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onJoin={joinChallenge}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateChallengeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createChallenge}
      />
    </AppShell>
  );
};
