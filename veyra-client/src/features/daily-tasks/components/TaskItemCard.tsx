import React from 'react';
import { Check, Trash2, Calendar, Lock, Clock, AlertCircle, X } from 'lucide-react';
import type { TaskOccurrence } from '../types';
import { getIndianTodayDateString } from '@/lib/date';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';

interface TaskItemCardProps {
  occurrence: TaskOccurrence;
  onToggle: (occurrenceId: string, completed?: boolean) => void;
  onDelete?: (taskId: string) => void;
  isReadOnly?: boolean;
}

export const TaskItemCard: React.FC<TaskItemCardProps> = React.memo(({
  occurrence,
  onToggle,
  onDelete,
  isReadOnly = false,
}) => {
  const { completed, task } = occurrence;
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const effectiveDueTime = occurrence.effectiveDueTime || occurrence.task?.dueTime || null;
  const todayStr = getIndianTodayDateString();
  const isDayOver = occurrence.date < todayStr;

  // Rule 1: A task is NEVER marked as not done/missed until the day is completely over!
  const isMissed = !completed && isDayOver;

  // Rule 2: If due time has passed today, allow completion with late points (+5 XP)
  const isLateToday = React.useMemo(() => {
    if (completed || isDayOver || !effectiveDueTime) return false;
    if (occurrence.date !== todayStr) return false;
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const [h, m] = effectiveDueTime.split(':').map(Number);
    return currentMin > h * 60 + m;
  }, [completed, isDayOver, occurrence.date, effectiveDueTime, todayStr]);

  const isUrgent = React.useMemo(() => {
    if (completed || isMissed || isLateToday || !effectiveDueTime) return false;
    if (occurrence.date !== todayStr) return false;
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const [h, m] = effectiveDueTime.split(':').map(Number);
    const diff = h * 60 + m - currentMin;
    return diff >= 0 && diff <= 60;
  }, [completed, isMissed, isLateToday, occurrence.date, effectiveDueTime, todayStr]);

  const cardBorderClass = completed
    ? 'border-emerald-500/30 bg-emerald-500/5'
    : isMissed
    ? 'border-rose-500/30 bg-rose-500/5'
    : isLateToday
    ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'
    : 'border-white/10 hover:border-blue-500/30 hover:bg-white/5';

  // Rule 3: Past entries are locked and cannot be changed after the day is over
  const canToggle = !isReadOnly && !isDayOver;

  const checkboxButtonClass = completed
    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20'
    : isMissed
    ? 'border border-rose-500/40 bg-rose-500/10 text-rose-400 cursor-not-allowed'
    : isDayOver || isReadOnly
    ? 'border border-white/20 bg-white/5 opacity-50 cursor-not-allowed'
    : isLateToday
    ? 'border border-amber-500/50 bg-amber-500/10 hover:border-amber-400 active:scale-95'
    : 'border border-white/20 hover:border-blue-500 bg-white/5 active:scale-95';

  const checkboxTitle = isDayOver || isReadOnly
    ? 'Historical entries are locked after the day is over'
    : isLateToday
    ? `Due time passed (${effectiveDueTime}). Complete today for +5 XP`
    : completed
    ? 'Mark incomplete'
    : 'Mark complete (+15 XP)';

  return (
    <div className={`glass p-4 rounded-xl transition-all duration-200 flex items-center justify-between gap-3 border ${cardBorderClass}`}>
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {/* Interactive Checkbox */}
        <button
          type="button"
          onClick={() => canToggle && onToggle(occurrence.id, !completed)}
          disabled={!canToggle}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${checkboxButtonClass}`}
          title={checkboxTitle}
          aria-label={checkboxTitle}
        >
          {completed ? (
            <Check size={16} strokeWidth={3} />
          ) : isMissed ? (
            <X size={14} strokeWidth={2.5} className="text-rose-400" />
          ) : isDayOver || isReadOnly ? (
            <Lock size={12} className="text-zinc-500" />
          ) : null}
        </button>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base select-none shrink-0">{task?.emoji || '✨'}</span>
            <span
              className={`text-fluid-sm font-medium truncate ${
                completed
                  ? 'line-through text-zinc-400'
                  : isMissed
                  ? 'text-rose-200/70'
                  : 'text-white'
              }`}
            >
              {task?.title || 'Daily Habit'}
            </span>
          </div>

          {task?.description && (
            <p className="text-fluid-xs text-zinc-400 mt-0.5 truncate pl-6">{task.description}</p>
          )}
        </div>
      </div>

      {/* Trailing badges / actions */}
      <div className="flex items-center gap-2 shrink-0">
        {completed ? (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            {occurrence.xpAwarded === 5 ? '+5 XP (Late)' : `+${occurrence.xpAwarded || 15} XP`}
          </span>
        ) : isMissed ? (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertCircle size={11} /> Missed (Day Ended)
          </span>
        ) : isLateToday ? (
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock size={11} className="text-amber-400" /> Due {effectiveDueTime} • Late (+5 XP)
          </span>
        ) : isUrgent ? (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
            <Clock size={11} /> Due {effectiveDueTime} (+15 XP)
          </span>
        ) : effectiveDueTime ? (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1">
            <Clock size={11} /> Due {effectiveDueTime} (+15 XP)
          </span>
        ) : (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10 hidden sm:inline-flex items-center gap-1">
            <Calendar size={10} /> Daily (+15 XP)
          </span>
        )}

        {onDelete && !isReadOnly && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(true);
            }}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete habit"
            aria-label="Delete habit"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Confirmation Modal before deleting */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        title="Delete Habit?"
        itemName={task?.title || 'Daily Habit'}
        itemType="habit"
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          const idToDelete = task?.id || occurrence.taskId;
          if (idToDelete && onDelete) onDelete(idToDelete);
          setShowDeleteModal(false);
        }}
      />
    </div>
  );
});

TaskItemCard.displayName = 'TaskItemCard';

