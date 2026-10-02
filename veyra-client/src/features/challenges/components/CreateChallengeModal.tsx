/** Modal for creating a new public or private challenge sprint. */
import React, { useState } from 'react';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { Trophy, Sparkles, X, Calendar, Target, Flame } from 'lucide-react';
import type { CreateChallengePayload, ChallengeType } from '../types';
import { getIndianTodayDateString, shiftDateString } from '@/lib/date';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateChallengePayload) => Promise<unknown>;
}

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (startDate > endDate) {
      setError('Start date cannot be after end date');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        targetValue,
        rewardXp,
        startDate,
        endDate,
        isPublic,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div
        className="glass-heavy relative z-10 w-full max-w-lg p-6 rounded-3xl border border-white/15 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-500">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="text-fluid-lg font-bold text-white">Create Challenge</h2>
              <p className="text-fluid-xs text-zinc-400">Rally friends or the community for a goal sprint</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-fluid-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-fluid-xs font-semibold text-zinc-300 mb-1.5">
              Challenge Title
            </label>
            <GlassInput
              type="text"
              placeholder="e.g. 21-Day Mindfulness & Meditation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-fluid-xs font-semibold text-zinc-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-fluid-xs placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 resize-none h-20"
              placeholder="Explain the rules and what habits count towards this challenge..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Challenge Type */}
          <div>
            <label className="block text-fluid-xs font-semibold text-zinc-300 mb-1.5">
              Challenge Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'daily_streak', label: 'Daily Streak', icon: <Flame size={14} className="text-orange-400" /> },
                { id: 'task_count', label: 'Habit Count', icon: <Target size={14} className="text-emerald-400" /> },
                { id: 'custom', label: 'Custom Goal', icon: <Trophy size={14} className="text-blue-500" /> },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setType(fmt.id as ChallengeType)}
                  className={`p-2.5 rounded-xl border text-center text-fluid-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    type === fmt.id
                      ? 'bg-blue-500/20 border-blue-500 text-white shadow-sm'
                      : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {fmt.icon}
                  <span>{fmt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Value & Reward XP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-fluid-xs font-semibold text-zinc-300 mb-1.5">
                Target Value
              </label>
              <GlassInput
                type="number"
                min={1}
                max={1000}
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                required
              />
              <span className="text-[10px] text-zinc-400 mt-0.5 block">
                {type === 'daily_streak' ? 'Consecutive days' : 'Total habit checks'}
              </span>
            </div>

            <div>
              <label className="block text-fluid-xs font-semibold text-zinc-300 mb-1.5">
                Reward XP
              </label>
              <GlassInput
                type="number"
                min={50}
                max={5000}
                step={50}
                value={rewardXp}
                onChange={(e) => setRewardXp(Number(e.target.value))}
                required
              />
              <span className="text-[10px] text-amber-300 mt-0.5 block flex items-center gap-1">
                <Sparkles size={10} /> Bonus upon target completion
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-fluid-xs font-semibold text-zinc-300 mb-1.5">
                Start Date
              </label>
              <GlassInput
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-fluid-xs font-semibold text-zinc-300 mb-1.5">
                End Date
              </label>
              <GlassInput
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <GlassButton type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? 'Creating...' : 'Launch Challenge'}
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
};
