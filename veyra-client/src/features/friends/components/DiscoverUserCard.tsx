/** Card component to display a community user with direct Add Friend button and status indicator. */
import React, { useState } from 'react';
import { UserPlus, Check, Clock, Flame, Sparkles, Loader2, UserCheck } from 'lucide-react';
import { GlassButton } from '@/components/glass/GlassButton';
import type { DiscoverUser } from '../types';

interface DiscoverUserCardProps {
  user: DiscoverUser;
  onAddFriend: (targetUsername: string) => Promise<unknown>;
  onAcceptRequest?: (requestId: string) => Promise<unknown>;
}

export const DiscoverUserCard: React.FC<DiscoverUserCardProps> = ({
  user,
  onAddFriend,
  onAcceptRequest,
}) => {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState<DiscoverUser['friendshipStatus']>(user.friendshipStatus);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!user.username || isActionLoading) return;
    setIsActionLoading(true);
    setErrorMsg(null);
    try {
      await onAddFriend(user.username);
      setLocalStatus('pending_sent');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not send request');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user.requestId || !onAcceptRequest || isActionLoading) return;
    setIsActionLoading(true);
    setErrorMsg(null);
    try {
      await onAcceptRequest(user.requestId);
      setLocalStatus('friends');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not accept request');
    } finally {
      setIsActionLoading(false);
    }
  };

  const status = localStatus;

  return (
    <div className="glass p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3 group relative overflow-hidden">
      {/* Background ambient hover sheen */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* User Info Left Section */}
      <div className="flex items-center gap-3 min-w-0 relative z-10">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name || user.username || 'User'}
            className="w-12 h-12 rounded-2xl object-cover border border-white/15 shadow-sm shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-blue-500/40 flex items-center justify-center text-white font-bold text-fluid-base shadow-sm shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-fluid-sm font-bold text-white truncate leading-tight">
              {user.name || user.username}
            </h4>
            <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold shrink-0">
              Lvl {user.level || 1}
            </span>
          </div>

          <p className="text-fluid-xs text-zinc-400 truncate mt-0.5">
            @{user.username || 'user'}
          </p>

          <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
            <span className="flex items-center gap-1 text-orange-400 font-medium">
              <Flame size={12} />
              <span>{user.currentStreak || 0}d streak</span>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1 text-purple-300 font-medium">
              <Sparkles size={11} />
              <span>{user.totalXp || 0} XP</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Button Right Section */}
      <div className="relative z-10 shrink-0 flex flex-col items-end gap-1">
        {status === 'friends' ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-fluid-xs font-semibold">
            <Check size={14} />
            <span>Friends</span>
          </div>
        ) : status === 'pending_sent' ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-fluid-xs font-semibold">
            <Clock size={13} />
            <span>Request Sent</span>
          </div>
        ) : status === 'pending_received' ? (
          <button
            type="button"
            onClick={handleAccept}
            disabled={isActionLoading}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-fluid-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            {isActionLoading ? <Loader2 size={13} className="animate-spin" /> : <UserCheck size={14} />}
            <span>Accept</span>
          </button>
        ) : (
          <GlassButton
            variant="primary"
            size="sm"
            onClick={handleAdd}
            disabled={isActionLoading}
            className="text-fluid-xs font-bold flex items-center gap-1.5 px-3.5 py-1.5"
          >
            {isActionLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <UserPlus size={14} />
            )}
            <span>Add Friend</span>
          </GlassButton>
        )}

        {errorMsg && (
          <span className="text-[10px] text-rose-400 font-medium max-w-[120px] text-right truncate">
            {errorMsg}
          </span>
        )}
      </div>
    </div>
  );
};
