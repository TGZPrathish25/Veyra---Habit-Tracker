/**
 * ConfirmDeleteModal — Accessible, glassmorphic confirmation modal for deleting tasks/goals.
 * Reassures users that past history and streak records are preserved, and only future goals are deleted.
 */
import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { GlassButton } from '@/components/glass/GlassButton';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName: string;
  itemType?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = 'Delete Habit?',
  itemName,
  itemType = 'habit',
  isDeleting = false,
  onConfirm,
  onClose,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => {
        if (!isDeleting) onClose();
      }}
    >
      <div
        className="glass-heavy max-w-md w-full p-6 rounded-3xl border border-white/10 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Warning Icon & Close */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-500/10">
            <Trash2 size={22} />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Cancel deletion"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div>
          <h3 id="confirm-delete-title" className="text-fluid-lg font-bold text-white mb-2">
            {title}
          </h3>
          <p className="text-fluid-sm text-zinc-300 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-white">"{itemName}"</span>?
          </p>
        </div>

        {/* Reassurance Callout Box */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-emerald-300">
          <ShieldCheck size={20} className="shrink-0 text-emerald-400 mt-0.5" />
          <div className="text-fluid-xs leading-relaxed">
            <p className="font-semibold text-emerald-200 mb-0.5">Past History Preserved</p>
            <p className="text-emerald-300/80">
              Your past completions, streak milestones, and earned XP remain safely intact. Only future scheduled occurrences will be deleted.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl text-fluid-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 border border-white/5 transition-all disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl text-fluid-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-600/30 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Delete Future Goals</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
