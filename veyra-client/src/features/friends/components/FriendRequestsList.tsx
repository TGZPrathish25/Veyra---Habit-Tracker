/** List of pending incoming friend requests with Accept & Decline buttons. */
import React, { useState } from 'react';
import { GlassButton } from '@/components/glass/GlassButton';
import { Check, X, UserCheck, Flame, Zap } from 'lucide-react';
import type { FriendRequest } from '../types';

interface FriendRequestsListProps {
  requests: FriendRequest[];
  onRespond: (requestId: string, action: 'accept' | 'reject') => Promise<unknown>;
}

export const FriendRequestsList: React.FC<FriendRequestsListProps> = ({ requests, onRespond }) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (requests.length === 0) {
    return (
      <div className="glass p-8 rounded-2xl border border-white/5 text-center text-zinc-400 text-fluid-sm">
        <UserCheck size={36} className="mx-auto text-zinc-500 mb-2" />
        <p className="font-semibold text-white">No pending friend requests</p>
        <p className="text-fluid-xs text-zinc-400 mt-1">When someone sends you a friend request, it will show up here.</p>
      </div>
    );
  }

  const handleAction = async (requestId: string, action: 'accept' | 'reject') => {
    setProcessingId(requestId);
    try {
      await onRespond(requestId, action);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <div
          key={req.id}
          className="glass p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 font-bold text-fluid-base">
              {req.sender.name ? req.sender.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="font-bold text-white text-fluid-sm">{req.sender.name || req.sender.username}</div>
              <div className="text-fluid-xs text-zinc-400">@{req.sender.username || 'user'}</div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-300">
                <span className="flex items-center gap-0.5 text-purple-300 font-medium">
                  <Zap size={11} /> Lv. {req.sender.level}
                </span>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-orange-400 font-medium">
                  <Flame size={11} /> {req.sender.currentStreak}d streak
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <GlassButton
              variant="ghost"
              onClick={() => handleAction(req.id, 'reject')}
              disabled={processingId === req.id}
              className="text-fluid-xs px-3 py-1.5"
            >
              <X size={13} className="mr-1" /> Decline
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={() => handleAction(req.id, 'accept')}
              disabled={processingId === req.id}
              className="text-fluid-xs px-3 py-1.5"
            >
              <Check size={13} className="mr-1" /> Accept
            </GlassButton>
          </div>
        </div>
      ))}
    </div>
  );
};
