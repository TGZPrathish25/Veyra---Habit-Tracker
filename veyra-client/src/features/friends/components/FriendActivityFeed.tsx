/** Activity feed showing live friend achievements, streak milestones, and daily completions. */
import React from 'react';
import { Award, Flame, CheckCircle2, Trophy, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { FriendActivityFeedItem } from '../types';

interface FriendActivityFeedProps {
  feed: FriendActivityFeedItem[];
}

const ACTION_ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  streak: {
    icon: <Flame size={16} className="text-orange-400" />,
    color: 'text-orange-400',
    bg: 'bg-orange-500/20 border-orange-500/30',
  },
  achievement: {
    icon: <Award size={16} className="text-blue-500" />,
    color: 'text-blue-500',
    bg: 'bg-blue-500/20 border-blue-500/30',
  },
  completed_day: {
    icon: <CheckCircle2 size={16} className="text-emerald-400" />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20 border-emerald-500/30',
  },
  joined_challenge: {
    icon: <Trophy size={16} className="text-amber-400" />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/20 border-amber-500/30',
  },
};

export const FriendActivityFeed: React.FC<FriendActivityFeedProps> = ({ feed }) => {
  if (feed.length === 0) {
    return (
      <div className="glass p-8 rounded-2xl border border-white/5 text-center text-zinc-400 text-fluid-sm">
        <Clock size={36} className="mx-auto text-zinc-500 mb-2" />
        <p className="font-semibold text-white">No recent activity</p>
        <p className="text-fluid-xs text-zinc-400 mt-1">Updates will appear as your friends complete habits and earn badges.</p>
      </div>
    );
  }

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="space-y-3">
      {feed.map((item) => {
        const conf = ACTION_ICONS[item.actionType] || ACTION_ICONS.completed_day;
        return (
          <div
            key={item.id}
            className="glass p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-3 select-none hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', conf.bg)}>
                {conf.icon}
              </div>
              <div>
                <p className="text-fluid-xs text-white">
                  <span className="font-bold">{item.userName}</span>{' '}
                  <span className="text-zinc-300 font-normal">{item.text}</span>
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                  <span>Level {item.userLevel}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(item.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
