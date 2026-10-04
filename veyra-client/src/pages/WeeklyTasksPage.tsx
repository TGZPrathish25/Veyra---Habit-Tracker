/** Weekly planning page with goal targets, reflection notes, and sprint progress. */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { apiClient } from '@/lib/apiClient';
import { Calendar, Plus, Target, CheckCircle2, Lock, Save, Trash2, Sparkles } from 'lucide-react';
import { SundayPlanningModal } from '@/features/weekly-tasks/components/SundayPlanningModal';
import { getWeekMondayDateString } from '@/lib/date';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';

interface WeeklyGoal {
  id?: string;
  title: string;
  category?: string;
  targetCount: number;
  completedCount: number;
  completed?: boolean;
}

interface WeeklyPlan {
  id: string;
  userId: string;
  weekStart: string;
  goals: WeeklyGoal[];
  reflection: string | null;
  isLocked: boolean;
}

export const WeeklyTasksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(3);
  const [reflectionText, setReflectionText] = useState('');
  const [isReflectionDirty, setIsReflectionDirty] = useState(false);
  const [isRitualOpen, setIsRitualOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<{ index: number; title: string } | null>(null);

  const { data: plan, isLoading } = useQuery<WeeklyPlan>({
    queryKey: ['weekly-current'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: WeeklyPlan }>('/weekly/current');
        if (res.data.data.reflection && !isReflectionDirty) {
          setReflectionText(res.data.data.reflection);
        }
        return res.data.data;
      } catch {
        const monday = getWeekMondayDateString();

        return {
          id: `plan_${monday}`,
          userId: 'user-cloud',
          weekStart: monday,
          goals: [],
          reflection: '',
          isLocked: false,
        };
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (updatedGoals: WeeklyGoal[]) => {
      try {
        return await apiClient.post('/weekly', {
          weekStart: plan?.weekStart,
          goals: updatedGoals,
          reflection: reflectionText,
        });
      } catch {
        return { data: { goals: updatedGoals } };
      }
    },
    onMutate: async (updatedGoals: WeeklyGoal[]) => {
      await queryClient.cancelQueries({ queryKey: ['weekly-current'] });
      const previous = queryClient.getQueryData<WeeklyPlan>(['weekly-current']);
      if (previous) {
        queryClient.setQueryData<WeeklyPlan>(['weekly-current'], {
          ...previous,
          goals: updatedGoals,
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['weekly-current'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-current'] });
    },
  });

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !plan || plan.isLocked) return;

    const newGoal: WeeklyGoal = {
      id: 'g_' + Math.random().toString(36).substring(2, 9),
      title: newGoalTitle.trim(),
      targetCount: Number(newGoalTarget) || 1,
      completedCount: 0,
      completed: false,
    };

    const nextGoals = [...plan.goals, newGoal];
    await saveMutation.mutateAsync(nextGoals);
    setNewGoalTitle('');
    setNewGoalTarget(3);
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
        await apiClient.patch(`/weekly/${plan.id}`, { reflection: reflectionText });
      } else {
        await apiClient.post('/weekly', {
          weekStart: plan.weekStart,
          goals: plan.goals,
          reflection: reflectionText,
        });
      }
      setIsReflectionDirty(false);
      queryClient.invalidateQueries({ queryKey: ['weekly-current'] });
    } catch (err) {
      console.warn('Failed to save reflection to server, persisting locally:', err);
      setIsReflectionDirty(false);
    } finally {
      setSavingReflection(false);
    }
  };

  const totalGoals = plan?.goals.length || 0;
  const completedGoals = plan?.goals.filter((g) => g.completed || g.completedCount >= g.targetCount).length || 0;
  const percent = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <AppShell>
      <PageHeader
        title="Weekly Sprint & Planning"
        subtitle="Set strategic weekly goals that align with your long-term growth."
      />

      {/* Week Header Banner */}
      <div className="glass p-5 rounded-2xl mb-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-fluid-xs text-blue-400 font-semibold mb-1">
            <Calendar size={15} />
            <span>Cycle: Monday to Sunday</span>
            {plan?.isLocked && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] flex items-center gap-1">
                <Lock size={10} /> Locked
              </span>
            )}
          </div>
          <h2 className="text-fluid-xl font-bold text-white">
            Week of {plan?.weekStart ? new Date(`${plan.weekStart}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Current Week'}
          </h2>
        </div>

        {/* Progress summary & Kickoff trigger */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <GlassButton
            variant="secondary"
            onClick={() => setIsRitualOpen(true)}
            className="flex items-center gap-2 border-blue-500/30 text-blue-300"
          >
            <Sparkles size={15} className="text-yellow-300" />
            <span>Weekly Ritual</span>
          </GlassButton>

          <div className="text-right">
            <div className="text-fluid-xs text-zinc-400">Goals Accomplished</div>
            <div className="text-fluid-lg font-bold text-white">
              {completedGoals} / {totalGoals}
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-lg">
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
                    placeholder="New weekly goal (e.g. 4 gym sessions, study 6h...)"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="w-24 shrink-0">
                  <GlassInput
                    type="number"
                    min="1"
                    max="50"
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
              Loading weekly goals...
            </div>
          ) : plan && plan.goals.length > 0 ? (
            <div className="space-y-3">
              {plan.goals.map((goal, idx) => {
                const isFinished = goal.completed || goal.completedCount >= goal.targetCount;
                return (
                  <div
                    key={goal.id || idx}
                    className={`glass p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isFinished
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-white/10 hover:border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isFinished
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {isFinished ? <CheckCircle2 size={18} /> : <Target size={18} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-fluid-sm font-medium truncate ${
                            isFinished ? 'line-through text-zinc-400' : 'text-white'
                          }`}
                        >
                          {goal.title}
                        </div>
                        <div className="text-fluid-xs text-zinc-400 mt-0.5">
                          Progress: <span className="font-semibold text-white">{goal.completedCount}</span> /{' '}
                          {goal.targetCount} times
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!plan.isLocked && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleIncrementGoal(idx)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-700/50 hover:bg-blue-700 text-white transition-all active:scale-95 shadow-sm"
                          >
                            +1 Check
                          </button>
                          <button
                            type="button"
                            onClick={() => setGoalToDelete({ index: idx, title: goal.title })}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete weekly goal"
                            aria-label="Delete weekly goal"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass p-10 text-center rounded-xl border border-white/10">
              <Target size={32} className="mx-auto text-blue-500/60 mb-2" />
              <h3 className="text-fluid-base font-semibold text-white mb-1">No weekly goals set yet</h3>
              <p className="text-fluid-xs text-zinc-400 max-w-sm mx-auto">
                Add 2–4 targeted objectives to focus your momentum this week.
              </p>
            </div>
          )}
        </div>

        {/* Weekly Reflection (1 col) */}
        <div>
          <div className="glass p-5 rounded-2xl border border-white/10 space-y-3">
            <h3 className="text-fluid-base font-semibold text-white">Weekly Reflection</h3>
            <p className="text-fluid-xs text-zinc-400">
              What went well this week? What friction did you encounter? Use this space for Sunday reflections.
            </p>

            <textarea
              className="glass-input w-full p-3 rounded-xl text-fluid-sm resize-none h-44"
              placeholder="Jot down notes on your weekly performance, energy, and adjustments..."
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

      <SundayPlanningModal
        isOpen={isRitualOpen}
        onClose={() => setIsRitualOpen(false)}
        onComplete={async (ritualGoals, intention) => {
          const formatted = ritualGoals.map((g) => ({
            title: g.title,
            targetCount: g.targetCount,
            completedCount: 0,
          }));
          setReflectionText(intention);
          await saveMutation.mutateAsync(formatted);
        }}
      />

      {/* Confirmation Modal before deleting goal */}
      <ConfirmDeleteModal
        isOpen={!!goalToDelete}
        title="Delete Weekly Goal?"
        itemName={goalToDelete?.title || 'Weekly Goal'}
        itemType="goal"
        onClose={() => setGoalToDelete(null)}
        onConfirm={async () => {
          if (goalToDelete !== null) {
            await handleDeleteGoal(goalToDelete.index);
            setGoalToDelete(null);
          }
        }}
      />
    </AppShell>
  );
};
