/** Glassmorphic modal to create a recurring daily habit or task. */
import React, { useState } from 'react';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { X, Sparkles } from 'lucide-react';
import type { CreateTaskPayload } from '../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => Promise<unknown>;
}

const EMOJI_OPTIONS = ['✨', '🧘', '🏃', '📚', '💧', '🥗', '💻', '🎨', '✍️', '🛌', '🚶', '🎯'];
const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✨');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // Must keep at least one day
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        emoji: selectedEmoji,
        daysOfWeek: selectedDays,
        isRecurring: true,
      });
      setTitle('');
      setDescription('');
      setSelectedEmoji('✨');
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass p-6 w-full max-w-md rounded-2xl shadow-2xl relative border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedEmoji}</span>
            <h2 className="text-fluid-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Create New Habit
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-fluid-xs bg-red-500/10 border border-red-500/20 text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label="Habit Name"
            placeholder="e.g. Read 20 pages, 10 min Meditation..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          <div>
            <label className="block text-fluid-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              Choose Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-blue-700/50 border border-blue-500 scale-110 shadow-lg'
                      : 'bg-white/5 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-fluid-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              Description / Intention (Optional)
            </label>
            <textarea
              className="glass-input w-full p-2.5 rounded-xl text-fluid-sm resize-none h-20"
              placeholder="Why does this habit matter to you?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-fluid-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
              Repeat on Days
            </label>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map((day) => {
                const isSelected = selectedDays.includes(day.value);
                return (
                  <button
                    type="button"
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                      isSelected
                        ? 'bg-blue-700/80 text-white shadow-sm'
                        : 'bg-white/5 text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-fluid-sm text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <GlassButton type="submit" variant="primary" disabled={isSubmitting} className="min-w-[120px]">
              <Sparkles size={16} />
              <span>{isSubmitting ? 'Creating...' : 'Create Habit'}</span>
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
};
