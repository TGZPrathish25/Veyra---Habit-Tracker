/** Friends and social accountability management page. */
import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassButton } from '@/components/glass/GlassButton';
import {
  useFriends,
  FriendCard,
  FriendProgressModal,
  AddFriendModal,
  FriendRequestsList,
  FriendActivityFeed,
  DiscoverUserCard,
} from '@/features/friends';
import { Users, UserPlus, Flame, Shield, Radio, Bell, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

type Tab = 'friends' | 'find' | 'requests' | 'feed';

export const FriendsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const {
    friends,
    discoverUsers,
    incomingRequests,
    feed,
    pendingCount,
    isLoading,
    isLoadingDiscover,
    sendRequest,
    respondToRequest,
    updatePrivacy,
    removeFriend,
  } = useFriends();

  const isDummy = (u: { id?: string; username?: string | null; name?: string | null }) => {
    if (!u) return true;
    const BANNED_IDS = ['usr_demo', 'demo', 'mock', 'usr_sarahkim', 'usr_jordanlee', 'usr_alexrivera', 'usr_samtaylor', 'usr_mayachen'];
    const BANNED_USERNAMES = ['demo', 'friend', 'sarah_k', 'sarahkim', 'jordan_lee', 'jordanlee', 'alex_r', 'alexrivera', 'sam_t', 'samtaylor', 'mayachen'];
    const BANNED_NAMES = ['demo user', 'friend', 'sarah kim', 'jordan lee', 'alex rivera', 'sam taylor', 'maya chen'];

    const id = u.id?.toLowerCase().trim();
    const uname = u.username?.toLowerCase().trim();
    const name = u.name?.toLowerCase().trim();

    if (id && BANNED_IDS.includes(id)) return true;
    if (uname && BANNED_USERNAMES.includes(uname)) return true;
    if (name && BANNED_NAMES.includes(name)) return true;
    return false;
  };

  const realFriends = friends.filter((f) => !isDummy(f.friend));
  const realDiscoverUsers = discoverUsers.filter((u) => !isDummy(u));

  const totalStreakWithFriends = realFriends.reduce((sum, f) => sum + f.friend.currentStreak, 0);

  const filteredDiscoverUsers = realDiscoverUsers.filter((u) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q);
  });

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <PageHeader
          title="Social Accountability & Friends"
          subtitle="Share habit progress with friends with customizable 4-tier privacy controls."
        />
        <GlassButton
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto text-fluid-xs font-bold gap-1.5 shrink-0"
        >
          <UserPlus size={15} />
          <span>Add Friend</span>
        </GlassButton>
      </div>

      {/* Top Social Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-between">
          <div>
            <div className="text-fluid-xs font-semibold uppercase tracking-wider text-blue-400">
              Total Friends
            </div>
            <div className="text-fluid-2xl font-black text-white mt-0.5">
              {friends.length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Users size={24} />
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 flex items-center justify-between">
          <div>
            <div className="text-fluid-xs font-semibold uppercase tracking-wider text-orange-300">
              Friend Momentum
            </div>
            <div className="text-fluid-2xl font-black text-white mt-0.5">
              {totalStreakWithFriends} Days 🔥
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Flame size={24} />
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-between">
          <div>
            <div className="text-fluid-xs font-semibold uppercase tracking-wider text-blue-300">
              Pending Requests
            </div>
            <div className="text-fluid-2xl font-black text-white mt-0.5">
              {pendingCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bell size={24} />
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Smooth horizontal scroll on mobile, no page overflow) */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6 overflow-x-auto no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveTab('friends')}
          className={cn(
            'px-4 py-2 rounded-xl text-fluid-xs font-semibold transition-all flex items-center gap-2 border shrink-0',
            activeTab === 'friends'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm'
              : 'text-zinc-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-white/5'
          )}
        >
          <Users size={14} />
          <span>My Friends</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] text-zinc-300">
            {friends.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('find')}
          className={cn(
            'px-4 py-2 rounded-xl text-fluid-xs font-semibold transition-all flex items-center gap-2 border shrink-0',
            activeTab === 'find'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm'
              : 'text-zinc-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-white/5'
          )}
        >
          <UserPlus size={14} />
          <span>Find Friends</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] text-zinc-300">
            {discoverUsers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={cn(
            'px-4 py-2 rounded-xl text-fluid-xs font-semibold transition-all flex items-center gap-2 border relative shrink-0',
            activeTab === 'requests'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm'
              : 'text-zinc-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-white/5'
          )}
        >
          <Bell size={14} />
          <span>Requests</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('feed')}
          className={cn(
            'px-4 py-2 rounded-xl text-fluid-xs font-semibold transition-all flex items-center gap-2 border shrink-0',
            activeTab === 'feed'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm'
              : 'text-zinc-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-white/5'
          )}
        >
          <Radio size={14} />
          <span>Activity Feed</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'friends' && (
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass p-5 rounded-2xl border border-white/5 h-48 animate-pulse" />
              ))}
            </div>
          ) : realFriends.length === 0 ? (
            <div className="space-y-6">
              <div className="glass p-8 sm:p-10 rounded-3xl border border-white/10 text-center relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 mx-auto flex items-center justify-center text-blue-400 mb-3 shadow-inner">
                  <Users size={32} />
                </div>
                <h3 className="text-fluid-lg font-bold text-white mb-1">No friends added yet</h3>
                <p className="text-fluid-xs text-zinc-400 max-w-md mx-auto mb-4">
                  Connect with members of the Veyra community below to stay accountable, compare streaks, and share progress.
                </p>
                <GlassButton variant="primary" onClick={() => setActiveTab('find')}>
                  <UserPlus size={14} className="mr-1.5" /> View Community Directory ({realDiscoverUsers.length})
                </GlassButton>
              </div>

              {/* Directly list community users with Add Friend buttons right on the page */}
              {realDiscoverUsers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-yellow-400" />
                      <h4 className="text-fluid-sm font-bold text-white">Community Members</h4>
                    </div>
                    <span className="text-fluid-xs text-zinc-400">Click Add Friend to connect</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {realDiscoverUsers.map((user) => (
                      <DiscoverUserCard
                        key={user.id}
                        user={user}
                        onAddFriend={async (targetUsername) => {
                          await sendRequest({ targetUsername });
                        }}
                        onAcceptRequest={async (requestId) => {
                          await respondToRequest({ requestId, action: 'accept' });
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {realFriends.map((friendship) => (
                  <FriendCard
                    key={friendship.id}
                    friendship={friendship}
                    onViewProgress={(id) => setSelectedFriendId(id)}
                    onUpdatePrivacy={(friendId, privacyLevel) =>
                      updatePrivacy({ friendId, privacyLevel })
                    }
                    onRemove={removeFriend}
                  />
                ))}
              </div>

              {/* Suggestions Section below active friends */}
              {realDiscoverUsers.some((u) => u.friendshipStatus === 'none') && (
                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-yellow-400" />
                      <h4 className="text-fluid-sm font-bold text-white">Suggested Friends</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('find')}
                      className="text-fluid-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      View All ({realDiscoverUsers.length}) →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {realDiscoverUsers
                      .filter((u) => u.friendshipStatus === 'none')
                      .slice(0, 3)
                      .map((user) => (
                        <DiscoverUserCard
                          key={user.id}
                          user={user}
                          onAddFriend={async (targetUsername) => {
                            await sendRequest({ targetUsername });
                          }}
                          onAcceptRequest={async (requestId) => {
                            await respondToRequest({ requestId, action: 'accept' });
                          }}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Find Friends (Directory) Tab */}
      {activeTab === 'find' && (
        <div className="space-y-4">
          {/* Filter Bar & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass p-4 rounded-2xl border border-white/10">
            <div>
              <h3 className="text-fluid-base font-bold text-white">Community Directory</h3>
              <p className="text-fluid-xs text-zinc-400">
                Browse every user on Veyra and send friend requests directly with one click.
              </p>
            </div>
            <div className="relative min-w-[240px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Filter by name or @username..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-fluid-xs focus:outline-none focus:border-blue-500/50"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {isLoadingDiscover ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass p-5 rounded-2xl border border-white/5 h-24 animate-pulse" />
              ))}
            </div>
          ) : filteredDiscoverUsers.length === 0 ? (
            <div className="glass p-12 rounded-3xl border border-white/5 text-center">
              <Users size={40} className="mx-auto text-zinc-600 mb-2" />
              <h4 className="text-fluid-base font-bold text-white">
                {searchFilter ? 'No users found' : 'No other users yet'}
              </h4>
              <p className="text-fluid-xs text-zinc-400 mt-1">
                {searchFilter
                  ? `No users matched "${searchFilter}". Clear your filter to view all members.`
                  : 'No other registered users found yet. Invite friends to join Veyra and build habits together!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDiscoverUsers.map((user) => (
                <DiscoverUserCard
                  key={user.id}
                  user={user}
                  onAddFriend={async (targetUsername) => {
                    await sendRequest({ targetUsername });
                  }}
                  onAcceptRequest={async (requestId) => {
                    await respondToRequest({ requestId, action: 'accept' });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <FriendRequestsList
          requests={incomingRequests}
          onRespond={(requestId, action) => respondToRequest({ requestId, action })}
        />
      )}

      {activeTab === 'feed' && <FriendActivityFeed feed={feed} />}

      {/* Modals */}
      <AddFriendModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={sendRequest}
      />

      <FriendProgressModal
        friendId={selectedFriendId}
        onClose={() => setSelectedFriendId(null)}
      />
    </AppShell>
  );
};
