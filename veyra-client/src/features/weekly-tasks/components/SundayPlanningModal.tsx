/**
 * SundayPlanningModal — A mindful weekly kickoff ritual modal for planning upcoming weekly goals and intentions.
 */
import React, { useState, useEffect } from 'react';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { Sparkles, Target, Compass, CheckCircle2, X, Plus, Trash2, ArrowRight } from 'lucide-react';
import { playLevelUpFanfare } from '@/lib/sound';

interface SundayPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (goals: { title: string; targetCount: number }[], intention: string) => void;
}

export const SundayPlanningModal: React.FC<SundayPlanningModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [intention, setIntention] = useState('');
  const [goals, setGoals] = useState<{ title: string; targetCount: number }[]>([
    { title: 'Morning Movement / Workout', targetCount: 4 },
    { title: 'Deep Work Focus Sprints', targetCount: 10 },
    { title: 'Nightly Reading / Journaling', targetCount: 5 },
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newCount, setNewCount] = useState(3);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setGoals([...goals, { title: newTitle.trim(), targetCount: Number(newCount) || 1 }]);
    setNewTitle('');
    setNewCount(3);
  };

  const handleRemoveGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    playLevelUpFanfare();
    onComplete(goals, intention);
    setStep(3);
    setTimeout(() => {
      onClose();
      setStep(1);
    }, 2200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="weekly-ritual-title"
      data-testid="weeklyTasks-sundayplanningmodal"
    >
      <div className="glass p-6 sm:p-8 w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glowing banner accent */}
        <div
          className="absolute top-0 inset-x-0 h-1.5"
          style={{ background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #3b82f6)' }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close weekly ritual modal"
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                <Compass size={24} />
              </div>
              <div>
                <h2 id="weekly-ritual-title" className="text-fluid-lg font-bold text-white">
                  Sunday Planning Ritual 🌟
                </h2>
                <p className="text-fluid-xs text-zinc-400">
                  Step 1 of 2: Set your guiding intention for the coming week.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="intention-input" className="block text-fluid-xs font-medium text-zinc-300">
                What is your central focus or mindset this week?
              </label>
              <textarea
                id="intention-input"
                rows={3}
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="e.g. Focus on deep uninterrupted work blocks and prioritize evening recovery..."
                className="w-full rounded-xl p-3 bg-black/40 border border-white/10 text-white text-fluid-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <GlassButton
                variant="primary"
                onClick={() => setStep(2)}
                className="flex items-center gap-2"
              >
                <span>Define Sprint Goals</span>
                <ArrowRight size={16} />
              </GlassButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                <Target size={24} />
              </div>
              <div>
                <h2 id="weekly-ritual-title" className="text-fluid-lg font-bold text-white">
                  Set Your Sprint Goals 🎯
                </h2>
                <p className="text-fluid-xs text-zinc-400">
                  Step 2 of 2: Define targets you aim to achieve by Sunday.
                </p>
              </div>
            </div>

            {/* List of active goals */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {goals.map((goal, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-fluid-xs text-zinc-200"
                >
                  <span className="font-medium text-white">{goal.title}</span>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold">
                      {goal.targetCount}x target
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(idx)}
                      aria-label={`Remove goal ${goal.title}`}
                      className="text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add goal inline form */}
            <form onSubmit={handleAddGoal} className="flex gap-2">
              <input
                type="text"
                placeholder="New sprint goal (e.g. Gym workout)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 rounded-xl px-3 py-2 bg-black/40 border border-white/10 text-white text-fluid-xs placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <input
                type="number"
                min={1}
                max={50}
                value={newCount}
                onChange={(e) => setNewCount(parseInt(e.target.value) || 1)}
                className="w-16 rounded-xl px-2 py-2 bg-black/40 border border-white/10 text-white text-center text-fluid-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                title="Target completions this week"
              />
              <GlassButton type="submit" variant="secondary" size="sm" className="px-3">
                <Plus size={16} />
              </GlassButton>
            </form>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-fluid-xs text-zinc-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <GlassButton
                variant="primary"
                onClick={handleFinish}
                className="flex items-center gap-2"
              >
                <Sparkles size={16} className="text-yellow-300" />
                <span>Lock In Plan (+25 XP)</span>
              </GlassButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-8 space-y-4 animate-scaleUp">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-fluid-xl font-bold text-white">Weekly Plan Activated! 🚀</h3>
            <p className="text-fluid-sm text-zinc-300 max-w-sm mx-auto">
              Your sprint goals and intention are locked. You earned <strong className="text-purple-300">+25 XP</strong> for conducting your weekly kickoff!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
