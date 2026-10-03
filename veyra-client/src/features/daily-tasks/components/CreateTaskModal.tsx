/** Glassmorphic modal to create a recurring daily habit or task with end time / deadline. */
import React, { useState } from 'react';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { X, Sparkles, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
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

const PRESET_TIMES = [
  { label: 'Morning (09:00)', time: '09:00' },
  { label: 'Noon (12:00)', time: '12:00' },
  { label: 'Evening (18:00)', time: '18:00' },
  { label: 'Night (21:00)', time: '21:00' },
  { label: 'Midnight (23:59)', time: '23:59' },
];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✨');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [hasEndTime, setHasEndTime] = useState(true);
  const [dueTime, setDueTime] = useState('21:00');
  const [customizePerDay, setCustomizePerDay] = useState(false);
  const [dayDueTimes, setDayDueTimes] = useState<Record<number, string>>({});
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

  const handleDayTimeChange = (dayVal: number, timeVal: string) => {
    setDayDueTimes((prev) => ({
      ...prev,
      [dayVal]: timeVal,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a habit name');
      return;
    }

    let formattedDayDueTimes: Record<string, string> | null = null;
    if (hasEndTime) {
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(dueTime)) {
        setError('Please provide a valid deadline in HH:mm format (e.g. 21:00)');
        return;
      }
      if (customizePerDay) {
        formattedDayDueTimes = {};
        for (const d of selectedDays) {
          const t = dayDueTimes[d] || dueTime;
          if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(t)) {
            setError(`Please provide a valid time for ${DAYS.find((item) => item.value === d)?.label || 'day'}`);
            return;
          }
          formattedDayDueTimes[String(d)] = t;
        }
      }
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        emoji: selectedEmoji,
        daysOfWeek: selectedDays,
        dueTime: hasEndTime ? dueTime : null,
        dayDueTimes: hasEndTime && customizePerDay ? formattedDayDueTimes : null,
        isRecurring: true,
      });
      setTitle('');
      setDescription('');
      setSelectedEmoji('✨');
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
      setHasEndTime(true);
      setDueTime('21:00');
      setCustomizePerDay(false);
      setDayDueTimes({});
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative border border-white/10">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-transparent backdrop-blur-md pb-2 border-b border-white/10 z-10">
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
          <div className="mb-4 p-3 rounded-lg text-fluid-xs bg-red-500/10 border border-red-500/20 text-red-300 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{error}</span>
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
              className="glass-input w-full p-2.5 rounded-xl text-fluid-sm resize-none h-16"
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

          {/* Daily End Time Adder Section */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-400" />
                <span className="text-fluid-sm font-semibold text-white">Daily End Time / Deadline</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasEndTime}
                  onChange={(e) => setHasEndTime(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {hasEndTime ? (
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      {customizePerDay ? 'Default End Time' : 'Complete daily before:'}
                    </label>
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="glass-input w-full p-2 rounded-xl text-fluid-sm font-mono text-white bg-black/30 border border-white/20 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-4 sm:pt-0">
                    {PRESET_TIMES.map((preset) => (
                      <button
                        type="button"
                        key={preset.time}
                        onClick={() => setDueTime(preset.time)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                          dueTime === preset.time
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5'
                        }`}
                      >
                        {preset.time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Per-Day Customization Toggle */}
                <div className="pt-1 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setCustomizePerDay(!customizePerDay)}
                    className="flex items-center gap-1.5 text-fluid-xs text-blue-400 hover:text-blue-300 font-medium py-1 transition-colors"
                  >
                    <span>{customizePerDay ? 'Hide per-day end times' : 'Customize end time for each day'}</span>
                    {customizePerDay ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {customizePerDay && (
                    <div className="mt-2 space-y-2 p-2.5 rounded-lg bg-black/20 border border-white/5 animate-fade-in">
                      <p className="text-[11px] text-zinc-400 mb-2">
                        Specify individual deadlines for days when your schedule differs:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {DAYS.filter((d) => selectedDays.includes(d.value)).map((d) => (
                          <div key={d.value} className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-xs font-semibold text-white w-8">{d.label}</span>
                            <input
                              type="time"
                              value={dayDueTimes[d.value] || dueTime}
                              onChange={(e) => handleDayTimeChange(d.value, e.target.value)}
                              className="glass-input p-1 rounded-md text-xs font-mono text-white bg-black/40 border border-white/10 focus:border-blue-500 w-28 text-center"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Deadline rule explanation */}
                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-200/90 leading-relaxed flex items-start gap-2">
                  <AlertCircle size={14} className="text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Deadline Rule:</strong> Must be marked done before this time each day. If not completed within the time, it will automatically be marked as <strong>Not Done / Missed</strong> for that day.
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-fluid-xs text-zinc-400">
                No strict deadline set. Habit can be completed at any point before midnight.
              </p>
            )}
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

