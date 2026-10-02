/** Modal to search and send a friend request by username. */
import React, { useState } from 'react';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { UserPlus, Sparkles, X, Check } from 'lucide-react';
import type { SendFriendRequestPayload } from '../types';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: SendFriendRequestPayload) => Promise<unknown>;
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ targetUsername: username.trim() });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setUsername('');
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send friend request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      {/* Modal Dialog */}
      <div
        className="glass-heavy relative z-10 w-full max-w-md p-6 rounded-3xl border border-white/15 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-fluid-lg font-bold text-white">Add a Friend</h2>
              <p className="text-fluid-xs text-zinc-400">Search by Veyra username to connect</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center text-emerald-400 space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 mx-auto flex items-center justify-center text-emerald-400">
              <Check size={24} />
            </div>
            <p className="font-semibold text-fluid-sm">Friend request sent!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-fluid-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-fluid-xs font-semibold text-zinc-300 mb-1.5">
                Username
              </label>
              <GlassInput
                type="text"
                placeholder="e.g. mayachen or sam_t"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Tip: Try connecting with demo user <span className="text-purple-300 font-semibold">sam_t</span> or <span className="text-purple-300 font-semibold">mayachen</span>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <GlassButton type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </GlassButton>
              <GlassButton type="submit" variant="primary" disabled={isSubmitting || !username.trim()}>
                {isSubmitting ? 'Sending...' : 'Send Request'}
              </GlassButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
