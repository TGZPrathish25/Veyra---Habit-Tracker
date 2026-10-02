/**
 * CreateChallengePage — Full-page challenge sprint creator form.
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { Trophy, Sparkles, Calendar, ArrowLeft, Target, Flame } from 'lucide-react';
import { challengesApi } from '@/features/challenges/api/challengesApi';
import type { ChallengeType } from '@/features/challenges/types';
import { getIndianTodayDateString, shiftDateString } from '@/lib/date';

export const CreateChallengePage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ChallengeType>('daily_streak');
  const [targetValue, setTargetValue] = useState<number>(14);
  const [rewardXp, setRewardXp] = useState<number>(250);
  const [startDate, setStartDate] = useState(() => getIndianTodayDateString());
  const [endDate, setEndDate] = useState(() => shiftDateString(getIndianTodayDateString(), 14));
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a challenge title');
      return;
    }
    if (startDate > endDate) {
      setError('Start date cannot be after end date');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await challengesApi.createChallenge({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        targetValue,
        rewardXp,
        startDate,
        endDate,
        isPublic,
      });
      navigate('/challenges');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          to="/challenges"
          className="inline-flex items-center gap-2 text-fluid-xs text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Challenges</span>
        </Link>

        <PageHeader
          title="Create New Challenge Sprint"
          subtitle="Forge a community challenge. Accepted participants will have a daily habit injected into their routine."
        />

        <form onSubmit={handleSubmit} className="glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5 shadow-2xl">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-fluid-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-fluid-xs font-medium text-zinc-300">
              Challenge Sprint Title *
            </label>
            <GlassInput
              placeholder="e.g. 14-Day Morning Hydration Sprint"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-fluid-xs font-medium text-zinc-300">Description & Rules</label>
            <textarea
              rows={3}
              placeholder="Detail what participants must achieve each day to claim victory..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl p-3 bg-black/40 border border-white/10 text-white text-fluid-xs placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Type Selector */}
          <div className="space-y-1.5">
            <label className="block text-fluid-xs font-medium text-zinc-300">Sprint Format</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'daily_streak' as const, label: 'Daily Streak', icon: Flame, desc: 'Consecutive days' },
                { id: 'task_count' as const, label: 'Habit Count', icon: Target, desc: 'Total occurrences' },
                { id: 'custom' as const, label: 'Custom Goal', icon: Sparkles, desc: 'Open milestone' },
              ].map((format) => {
                const Icon = format.icon;
                const isSelected = type === format.id;
                return (
                  <button
                    key={format.id}
                    type="button"
                    onClick={() => setType(format.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/20 text-white'
                        : 'border-white/5 bg-white/5 text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={18} className={isSelected ? 'text-blue-400 mb-1' : 'mb-1'} />
                    <div className="text-fluid-xs font-bold text-white">{format.label}</div>
                    <div className="text-[10px] text-zinc-400">{format.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target & Reward XP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-fluid-xs font-medium text-zinc-300">Target Value (Days / Count)</label>
              <GlassInput
                type="number"
                min={1}
                max={365}
                value={targetValue}
                onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-fluid-xs font-medium text-zinc-300">Reward XP</label>
              <GlassInput
                type="number"
                min={10}
                max={5000}
                step={50}
                value={rewardXp}
                onChange={(e) => setRewardXp(parseInt(e.target.value) || 50)}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-fluid-xs font-medium text-zinc-300">Start Date</label>
              <GlassInput
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-fluid-xs font-medium text-zinc-300">End Date</label>
              <GlassInput
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Link to="/challenges">
              <button
                type="button"
                className="text-fluid-xs text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            </Link>

            <GlassButton
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Trophy size={16} />
              <span>{isSubmitting ? 'Publishing...' : 'Launch Challenge Sprint'}</span>
            </GlassButton>
          </div>
        </form>
      </div>
    </AppShell>
  );
};
