/** Leaderboard rankings page — Global platform rankings by XP, Level, and Streaks across all verified users. */
import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLeaderboard, type LeaderboardSortMetric } from '@/features/leaderboard';
import { useGamification, useStreaks } from '@/features/gamification';
import {
  Award,
  Flame,
  Medal,
  Users,
  Sparkles,
  Crown,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const { level, totalXp } = useGamification();
  const { dailyStreak } = useStreaks();

  const [activeTab, setActiveTab] = useState<LeaderboardSortMetric>('xp');
  const { entries: leaderboardEntries, isLoading } = useLeaderboard(activeTab);

  const currentUserId = user?.id;
  const currentFirebaseUid = user?.firebaseUid;
  const currentUsername = user?.username?.toLowerCase()?.trim();

  const isCurrentMe = (e: { id: string; username?: string | null }) => {
    if (!user) return false;
    if (currentUserId && e.id === currentUserId) return true;
    if (currentFirebaseUid && e.id === currentFirebaseUid) return true;
    if (currentUsername && e.username && e.username.toLowerCase().trim() === currentUsername) return true;
    return false;
  };

  // Filter dummy accounts and deduplicate by ID, username, and identity
  const seenIds = new Set<string>();
  const seenUsernames = new Set<string>();
  const sanitizedEntries: typeof leaderboardEntries = [];

  for (const entry of leaderboardEntries) {
    if (
      entry.id === 'usr_demo' ||
      entry.id === 'demo' ||
      entry.id === 'mock' ||
      entry.username?.toLowerCase() === 'demo' ||
      entry.username?.toLowerCase() === 'friend' ||
      entry.name === 'Demo User' ||
      entry.name === 'Friend'
    ) {
      continue;
    }

    const normUser = entry.username?.toLowerCase().trim();
    if (seenIds.has(entry.id)) continue;
    if (normUser && seenUsernames.has(normUser)) continue;

    if (isCurrentMe(entry)) {
      if (seenIds.has('CURRENT_USER_SEEN')) continue;
      seenIds.add('CURRENT_USER_SEEN');
    }

    seenIds.add(entry.id);
    if (normUser) seenUsernames.add(normUser);
    sanitizedEntries.push(entry);
  }

  const userFoundInLeaderboard = seenIds.has('CURRENT_USER_SEEN') || sanitizedEntries.some(isCurrentMe);

  const combinedEntries = sanitizedEntries.map((e) => {
    const isMe = isCurrentMe(e);
    return {
      id: e.id,
      name: isMe ? (user?.name || user?.username || e.name) : e.name || e.username || 'Adventurer',
      username: e.username,
      avatarUrl: isMe ? (user?.avatarUrl || e.avatarUrl) : e.avatarUrl,
      level: isMe ? Math.max(e.level, level || 1) : e.level,
      xp: isMe ? Math.max(e.totalXp, totalXp || 0) : e.totalXp,
      streak: isMe ? Math.max(e.currentStreak, dailyStreak || 0) : e.currentStreak,
      isMe: Boolean(isMe),
    };
  });

  // If authenticated user is not yet indexed in leaderboard, include them once
  if (!userFoundInLeaderboard && user) {
    combinedEntries.push({
      id: user.id || user.firebaseUid || 'me',
      name: user.name || user.username || 'You',
      username: user.username || 'you',
      avatarUrl: user.avatarUrl || null,
      level: level || 1,
      xp: totalXp || 0,
      streak: dailyStreak || 0,
      isMe: true,
    });
  }

  // Sort based on active tab
  const sortedEntries = [...combinedEntries].sort((a, b) => {
    if (activeTab === 'xp') {
      if (b.xp !== a.xp) return b.xp - a.xp;
      return b.streak - a.streak;
    }
    if (b.streak !== a.streak) return b.streak - a.streak;
    return b.xp - a.xp;
  });

  const topThree = sortedEntries.slice(0, 3);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center font-bold">
            <Crown size={16} />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-400/20 text-slate-300 border border-slate-400/40 flex items-center justify-center font-bold">
            <Medal size={16} />
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-700/20 text-amber-600 border border-amber-700/40 flex items-center justify-center font-bold">
            <Medal size={16} />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-white/5 text-zinc-400 border border-white/5 flex items-center justify-center text-fluid-xs font-bold">
            #{rank}
          </div>
        );
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Rankings & Leaderboard"
        subtitle="Global platform rankings by Experience (XP), Level, and Habit Streaks across all Veyra adventurers."
      />

      {/* Metric Selector Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('xp')}
          className={cn(
            'px-4 py-2 rounded-xl text-fluid-xs font-bold transition-all flex items-center gap-2 border',
            activeTab === 'xp'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm'
              : 'text-zinc-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-white/5'
          )}
        >
          <Award size={15} /> Top by Experience (XP)
        </button>
        <button
          onClick={() => setActiveTab('streak')}
          className={cn(
            'px-4 py-2 rounded-xl text-fluid-xs font-bold transition-all flex items-center gap-2 border',
            activeTab === 'streak'
              ? 'bg-orange-500/20 text-orange-200 border-orange-400/40 shadow-sm'
              : 'text-zinc-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-white/5'
          )}
        >
          <Flame size={15} /> Longest Active Streaks
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass p-6 rounded-3xl border border-white/5 h-56 animate-pulse" />
            ))}
          </div>
          <div className="glass p-6 rounded-3xl border border-white/5 h-64 animate-pulse" />
        </div>
      ) : sortedEntries.length === 0 ? (
        <div className="glass p-12 rounded-3xl border border-white/5 text-center mb-8">
          <Globe size={40} className="mx-auto text-zinc-600 mb-2" />
          <h4 className="text-fluid-base font-bold text-white">No active rankings yet</h4>
          <p className="text-fluid-xs text-zinc-400 mt-1">
            Complete daily habits to earn XP and be the first on the global leaderboard!
          </p>
        </div>
      ) : (
        <>
          {/* Podium Top 3 */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {topThree.map((item, index) => {
                const rank = index + 1;
                const isFirst = rank === 1;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'glass p-5 rounded-3xl border transition-all text-center relative overflow-hidden',
                      item.isMe ? 'ring-2 ring-blue-500/50' : '',
                      isFirst
                        ? 'border-amber-500/30 bg-amber-500/5 md:-translate-y-2'
                        : 'border-white/10'
                    )}
                  >
                    {isFirst && (
                      <div className="absolute top-3 right-3 text-amber-400 animate-pulse">
                        <Sparkles size={18} />
                      </div>
                    )}

                    <div className="flex justify-center mb-3">{getRankBadge(rank)}</div>

                    <div className="w-14 h-14 rounded-2xl mx-auto mb-3 bg-gradient-to-tr from-blue-700 to-blue-600 text-white font-black text-fluid-lg flex items-center justify-center shadow-lg overflow-hidden">
                      {item.avatarUrl ? (
                        <img src={item.avatarUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        item.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    <h3 className="text-fluid-base font-bold text-white truncate">
                      {item.name} {item.isMe && <span className="text-blue-500">(You)</span>}
                    </h3>
                    <p className="text-[11px] text-zinc-400 mb-3">@{item.username}</p>

                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-around">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-zinc-400">Level</div>
                        <div className="text-fluid-sm font-black text-blue-400">{item.level}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-zinc-400">
                          {activeTab === 'xp' ? 'Total XP' : 'Streak'}
                        </div>
                        <div className="text-fluid-sm font-black text-amber-300">
                          {activeTab === 'xp' ? `${item.xp.toLocaleString()} XP` : `${item.streak} days`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Standings Table */}
          <div className="glass rounded-3xl border border-white/10 overflow-hidden mb-6">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-fluid-base font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                Global Standings
              </h2>
              <span className="text-fluid-xs text-zinc-400">{sortedEntries.length} Adventurers</span>
            </div>

            <div className="divide-y divide-white/5">
              {sortedEntries.map((item, index) => {
                const rank = index + 1;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'p-4 flex items-center justify-between gap-4 transition-colors',
                      item.isMe ? 'bg-blue-500/10' : 'hover:bg-white/[0.02]'
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-8 text-center text-fluid-sm font-bold text-zinc-400">
                        {rank <= 3 ? getRankBadge(rank) : `#${rank}`}
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-blue-700/30 border border-blue-500/30 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden">
                        {item.avatarUrl ? (
                          <img src={item.avatarUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          item.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-fluid-sm font-bold text-white truncate flex items-center gap-2">
                          <span>{item.name}</span>
                          {item.isMe && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400">@{item.username}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 text-right">
                      <div>
                        <div className="text-[10px] text-zinc-400 uppercase font-semibold">Level</div>
                        <div className="text-fluid-xs font-bold text-white">{item.level}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-400 uppercase font-semibold">Streak</div>
                        <div className="text-fluid-xs font-bold text-orange-400 flex items-center justify-end gap-1">
                          <Flame size={12} /> {item.streak}d
                        </div>
                      </div>
                      <div className="min-w-[70px]">
                        <div className="text-[10px] text-zinc-400 uppercase font-semibold">XP</div>
                        <div className="text-fluid-xs font-bold text-amber-300">
                          {item.xp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
};
