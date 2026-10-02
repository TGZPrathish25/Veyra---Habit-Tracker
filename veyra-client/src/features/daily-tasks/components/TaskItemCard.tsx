/** Glassmorphic task occurrence card with animated checkbox and details. */
import React from 'react';
import { Check, Trash2, Calendar, Lock } from 'lucide-react';
import type { TaskOccurrence } from '../types';

interface TaskItemCardProps {
  occurrence: TaskOccurrence;
  onToggle: (occurrenceId: string, completed?: boolean) => void;
  onDelete?: (taskId: string) => void;
  isReadOnly?: boolean;
}

export const TaskItemCard: React.FC<TaskItemCardProps> = ({
  occurrence,
  onToggle,
  onDelete,
  isReadOnly = false,
}) => {
  const { completed, task } = occurrence;

  return (
    <div
      className={`glass p-4 rounded-xl transition-all duration-200 flex items-center justify-between gap-3 border ${
        completed
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-white/10 hover:border-purple-500/30 hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {/* Interactive Checkbox */}
        <button
          type="button"
          onClick={() => !isReadOnly && onToggle(occurrence.id, !completed)}
          disabled={isReadOnly}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${
            completed
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20'
              : isReadOnly
              ? 'border border-white/20 bg-white/5 opacity-50 cursor-not-allowed'
              : 'border border-white/20 hover:border-purple-400 bg-white/5 active:scale-95'
          }`}
          title={isReadOnly ? 'Historical entries cannot be modified' : completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {completed ? <Check size={16} strokeWidth={3} /> : isReadOnly ? <Lock size={12} className="text-zinc-500" /> : null}
        </button>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base select-none shrink-0">{task?.emoji || '✨'}</span>
            <span
              className={`text-fluid-sm font-medium truncate ${
                completed ? 'line-through text-zinc-400' : 'text-white'
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
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            +10 XP
          </span>
        ) : (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10 hidden sm:inline-flex items-center gap-1">
            <Calendar size={10} /> Daily
          </span>
        )}

        {onDelete && task && !isReadOnly && (
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete habit"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
};
