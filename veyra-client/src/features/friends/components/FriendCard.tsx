/** Friend card displaying friend status, streak, privacy level badge, and progress trigger. */
import React, { useState } from 'react';
import { Shield, Flame, Zap, Eye, MoreHorizontal, UserMinus } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Friendship, PrivacyLevel } from '../types';

interface FriendCardProps {
  friendship: Friendship;
  onViewProgress: (friendId: string) => void;
  onUpdatePrivacy: (friendId: string, privacyLevel: PrivacyLevel) => Promise<unknown>;
  onRemove: (friendId: string) => Promise<unknown>;
}

const PRIVACY_LABELS: Record<PrivacyLevel, { label: string; desc: string; badge: string }> = {
  basic: { label: 'L1: % Only', desc: 'Can only see your completion %', badge: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' },
  counts: { label: 'L2: Counts', desc: 'Can see task counts + %', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  detailed: { label: 'L3: Detailed', desc: 'Can see task titles and status', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  full: { label: 'L4: Full', desc: 'Can see full habits, streak, and notes', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
};

export const FriendCard: React.FC<FriendCardProps> = ({
  friendship,
  onViewProgress,
  onUpdatePrivacy,
  onRemove,
}) => {
  const { friend, privacyLevel } = friendship;
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePrivacyChange = async (newLevel: PrivacyLevel) => {
    setIsUpdating(true);
    try {
      await onUpdatePrivacy(friend.id, newLevel);
      setShowPrivacyMenu(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm(`Are you sure you want to remove ${friend.name || friend.username} from your friends?`)) {
      await onRemove(friend.id);
    }
  };

  return (
    <div className="glass p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between select-none relative group">
      <div>
        {/* Top Header: Avatar + User Info + Options */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 border border-blue-500/40 flex items-center justify-center text-white font-bold text-fluid-lg shadow-sm">
              {friend.name ? friend.name.charAt(0).toUpperCase() : friend.username?.charAt(0).toUpperCase() || 'F'}
            </div>
            <div>
              <h3 className="text-fluid-base font-bold text-white leading-tight">
                {friend.name || friend.username}
              </h3>
              <p className="text-fluid-xs text-zinc-400">@{friend.username || 'user'}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Privacy Badge / Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors flex items-center gap-1',
                  PRIVACY_LABELS[privacyLevel].badge
                )}
                title={`Your privacy toward this friend: ${PRIVACY_LABELS[privacyLevel].label}`}
              >
                <Shield size={10} />
                <span>{PRIVACY_LABELS[privacyLevel].label}</span>
              </button>

              {/* Privacy Menu Dropdown */}
              {showPrivacyMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 glass-heavy p-2 rounded-xl border border-white/20 shadow-2xl z-30 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1">
                    Your Privacy Setting
                  </div>
                  {(['basic', 'counts', 'detailed', 'full'] as PrivacyLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => handlePrivacyChange(lvl)}
                      disabled={isUpdating}
                      className={cn(
                        'w-full text-left px-2 py-1.5 rounded-lg text-fluid-xs transition-colors flex flex-col',
                        privacyLevel === lvl ? 'bg-blue-500/20 text-blue-300 font-semibold' : 'text-zinc-300 hover:bg-white/5'
                      )}
                    >
                      <span>{PRIVACY_LABELS[lvl].label}</span>
                      <span className="text-[10px] text-zinc-400 font-normal">{PRIVACY_LABELS[lvl].desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Remove Friend Button */}
            <button
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Remove friend"
            >
              <UserMinus size={15} />
            </button>
          </div>
        </div>

        {/* Stats Row: Streak, Level, Total XP */}
        <div className="grid grid-cols-3 gap-2 my-4 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
          <div>
            <div className="text-[10px] uppercase font-semibold text-orange-400 flex items-center justify-center gap-1">
              <Flame size={11} /> Streak
            </div>
            <div className="text-fluid-sm font-bold text-white mt-0.5">{friend.currentStreak}d</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-blue-500 flex items-center justify-center gap-1">
              <Zap size={11} /> Level
            </div>
            <div className="text-fluid-sm font-bold text-white mt-0.5">Lv. {friend.level}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-yellow-400 flex items-center justify-center gap-1">
              XP
            </div>
            <div className="text-fluid-sm font-bold text-white mt-0.5">{friend.totalXp.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Action: View Progress */}
      <button
        onClick={() => onViewProgress(friend.id)}
        className="w-full mt-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-blue-700/30 text-zinc-200 hover:text-gray-900 dark:hover:text-white border border-white/10 hover:border-blue-500/40 text-fluid-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
      >
        <Eye size={13} />
        <span>View Accountability Progress</span>
      </button>
    </div>
  );
};
