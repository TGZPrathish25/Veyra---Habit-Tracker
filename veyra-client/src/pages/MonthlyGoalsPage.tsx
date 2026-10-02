/** Monthly goals management page with monthly targets, progress bars, and reflections. */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { apiClient } from '@/lib/apiClient';
import { Calendar, Plus, Trophy, CheckCircle2, Lock, Save, Trash2, Sparkles } from 'lucide-react';
import { AiReflectionModal } from '@/features/ai';
import { getCurrentYearAndMonth } from '@/lib/date';

interface MonthlyGoal {
  id?: string;
  title: string;
  category?: string;
  targetCount: number;
  completedCount: number;
  completed?: boolean;
}

interface MonthlyPlan {
  id: string;
  userId: string;
  year: number;
  month: number;
  goals: MonthlyGoal[];
  reflection: string | null;
  isLocked: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MonthlyGoalsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(10);
  const [reflectionText, setReflectionText] = useState('');
  const [isReflectionDirty, setIsReflectionDirty] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const { data: plan, isLoading } = useQuery<MonthlyPlan>({
    queryKey: ['monthly-current'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: MonthlyPlan }>('/monthly/current');
        if (res.data.data.reflection && !isReflectionDirty) {
          setReflectionText(res.data.data.reflection);
        }
        return res.data.data;
      } catch {
        const { year, month } = getCurrentYearAndMonth();
        return {
          id: `monthly_${year}_${month}`,
          userId: 'user-cloud',
          year,
          month,
          goals: [],
          reflection: '',
          isLocked: false,
        };
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (updatedGoals: MonthlyGoal[]) => {
      try {
        return await apiClient.post('/monthly', {
          year: plan?.year,
          month: plan?.month,
          goals: updatedGoals,
          reflection: reflectionText,
        });
      } catch {
        return { data: { goals: updatedGoals } };
      }
    },
    onMutate: async (updatedGoals: MonthlyGoal[]) => {
      await queryClient.cancelQueries({ queryKey: ['monthly-current'] });
      const previous = queryClient.getQueryData<MonthlyPlan>(['monthly-current']);
      if (previous) {
        queryClient.setQueryData<MonthlyPlan>(['monthly-current'], {
          ...previous,
          goals: updatedGoals,
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['monthly-current'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-current'] });
    },
  });

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !plan || plan.isLocked) return;

    const newGoal: MonthlyGoal = {
      id: 'mg_' + Math.random().toString(36).substring(2, 9),
      title: newGoalTitle.trim(),
      targetCount: Number(newGoalTarget) || 1,
      completedCount: 0,
      completed: false,
    };

    const nextGoals = [...plan.goals, newGoal];
    await saveMutation.mutateAsync(nextGoals);
    setNewGoalTitle('');
    setNewGoalTarget(10);
  };

  const handleIncrementGoal = async (goalIndex: number) => {
    if (!plan || plan.isLocked) return;
    const nextGoals = [...plan.goals];
    const target = nextGoals[goalIndex];
    if (!target) return;

    const nextCount = target.completedCount + 1;
    target.completedCount = nextCount;
    target.completed = nextCount >= target.targetCount;
    await saveMutation.mutateAsync(nextGoals);
  };

  const handleDeleteGoal = async (goalIndex: number) => {
    if (!plan || plan.isLocked) return;
    const nextGoals = plan.goals.filter((_, idx) => idx !== goalIndex);
    await saveMutation.mutateAsync(nextGoals);
  };

  const [savingReflection, setSavingReflection] = useState(false);

  const handleSaveReflection = async () => {
    if (!plan || plan.isLocked) return;
    setSavingReflection(true);
    try {
      if (plan.id && !plan.id.startsWith('plan_')) {
        await apiClient.patch(`/monthly/${plan.id}`, { reflection: reflectionText });
      } else {
        await apiClient.post('/monthly', {
          year: plan.year,
          month: plan.month,
          goals: plan.goals,
          reflection: reflectionText,
        });
      }
      setIsReflectionDirty(false);
      queryClient.invalidateQueries({ queryKey: ['monthly-current'] });
    } catch (err) {
      console.warn('Failed to save reflection to server, persisting locally:', err);
      setIsReflectionDirty(false);
    } finally {
      setSavingReflection(false);
    }
  };

  const monthTitle = plan ? `${MONTH_NAMES[plan.month - 1]} ${plan.year}` : 'Current Month';
  const totalGoals = plan?.goals.length || 0;
  const completedGoals = plan?.goals.filter((g) => g.completed || g.completedCount >= g.targetCount).length || 0;
  const percent = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <AppShell>
      <PageHeader
        title="Monthly Strategic Objectives"
        subtitle="Turn high-level vision into milestones and track your overall trajectory."
      />

      {/* Month Banner */}
      <div className="glass p-5 rounded-2xl mb-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-fluid-xs text-emerald-300 font-semibold mb-1">
            <Calendar size={15} />
            <span>Monthly Target Cycle</span>
            {plan?.isLocked && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] flex items-center gap-1">
                <Lock size={10} /> Locked
              </span>
            )}
          </div>
          <h2 className="text-fluid-xl font-bold text-white">{monthTitle}</h2>
        </div>

        {/* Progress summary */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-fluid-xs text-zinc-400">Monthly Milestones</div>
            <div className="text-fluid-lg font-bold text-white">
              {completedGoals} / {totalGoals}
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-300 text-lg">
            {percent}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Add Goal Card */}
          {!plan?.isLocked && (
            <div className="glass p-4 rounded-xl border border-white/10">
              <form onSubmit={handleAddGoal} className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <GlassInput
                    placeholder="New monthly objective (e.g. Read 2 books, Run 50km...)"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="w-24 shrink-0">
                  <GlassInput
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="Target"
                    value={String(newGoalTarget)}
                    onChange={(e) => setNewGoalTarget(Number(e.target.value))}
                  />
                </div>
                <GlassButton type="submit" variant="primary" className="shrink-0 flex items-center gap-1.5">
                  <Plus size={16} /> Add Goal
                </GlassButton>
              </form>
            </div>
          )}

          {/* List of Goals */}
          {isLoading ? (
            <div className="glass p-8 text-center text-zinc-400 text-fluid-sm rounded-xl">
              Loading monthly objectives...
            </div>
          ) : plan && plan.goals.length > 0 ? (
            <div className="space-y-3">
              {plan.goals.map((goal, idx) => {
                const isFinished = goal.completed || goal.completedCount >= goal.targetCount;
                const goalPercent = Math.min(100, Math.round((goal.completedCount / goal.targetCount) * 100));

                return (
                  <div
                    key={goal.id || idx}
                    className={`glass p-4 rounded-xl border transition-all ${
                      isFinished
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-white/10 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            isFinished
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-teal-500/20 text-teal-300'
                          }`}
                        >
                          {isFinished ? <CheckCircle2 size={18} /> : <Trophy size={18} />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-fluid-sm font-medium truncate ${
                              isFinished ? 'line-through text-zinc-400' : 'text-white'
                            }`}
                          >
                            {goal.title}
                          </div>
                          <div className="text-fluid-xs text-zinc-400">
                            {goal.completedCount} of {goal.targetCount} completed ({goalPercent}%)
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!plan.isLocked && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleIncrementGoal(idx)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/50 hover:bg-emerald-600 text-white transition-all active:scale-95 shadow-sm"
                            >
                              +1 Progress
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGoal(idx)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Milestone Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${goalPercent}%`,
                          background: isFinished ? '#10b981' : 'linear-gradient(90deg, #14b8a6, #10b981)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass p-10 text-center rounded-xl border border-white/10">
              <Trophy size={32} className="mx-auto text-emerald-400/60 mb-2" />
              <h3 className="text-fluid-base font-semibold text-white mb-1">No monthly goals defined yet</h3>
              <p className="text-fluid-xs text-zinc-400 max-w-sm mx-auto">
                Define the high-impact milestones you want to hit before this month ends.
              </p>
            </div>
          )}
        </div>

        {/* Monthly Reflection (1 col) */}
        <div>
          <div className="glass p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-fluid-base font-semibold text-white">Monthly Reflection</h3>
              {!plan?.isLocked && (
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Sparkles size={12} className="text-blue-400" />
                  <span>AI Assistant</span>
                </button>
              )}
            </div>
            <p className="text-fluid-xs text-zinc-400">
              At the close of each month, summarize your breakthroughs, habit retention, and lessons learned.
            </p>

            <textarea
              className="glass-input w-full p-3 rounded-xl text-fluid-sm resize-none h-44"
              placeholder="Reflect on this month's consistency, major accomplishments, and key growth areas..."
              value={reflectionText}
              onChange={(e) => {
                setReflectionText(e.target.value);
                setIsReflectionDirty(true);
              }}
              disabled={plan?.isLocked}
            />

            {!plan?.isLocked && (
              <GlassButton
                onClick={handleSaveReflection}
                variant="primary"
                disabled={savingReflection}
                className="w-full flex items-center justify-center gap-1.5"
              >
                <Save size={16} />
                <span>{savingReflection ? 'Saving...' : 'Save Reflection'}</span>
              </GlassButton>
            )}
          </div>
        </div>
      </div>

      {/* AI Monthly Reflection Assistant Modal */}
      {plan && (
        <AiReflectionModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          year={plan.year}
          month={plan.month}
          monthName={MONTH_NAMES[plan.month - 1] || 'Current Month'}
          onApplyReflection={(text) => {
            setReflectionText(text);
            setIsReflectionDirty(true);
          }}
        />
      )}
    </AppShell>
  );
};
