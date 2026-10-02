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
} from '@/features/friends';
import { Users, UserPlus, Flame, Shield, Radio, Bell } from 'lucide-react';
import { cn } from '@/lib/cn';

type Tab = 'friends' | 'requests' | 'feed';

export const FriendsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);

  const {
    friends,
    incomingRequests,
    feed,
    pendingCount,
    isLoading,
    sendRequest,
    respondToRequest,
    updatePrivacy,
    removeFriend,
  } = useFriends();

  const totalStreakWithFriends = friends.reduce((sum, f) => sum + f.friend.currentStreak, 0);

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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('friends')}
          className={cn(
            'px-4 py-2 rounded-xl text-fluid-xs font-semibold transition-all flex items-center gap-2 border',
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
          onClick={() => setActiveTab('requests')}
          className={cn(
            'px-4 py-2 rounded-xl text-fluid-xs font-semibold transition-all flex items-center gap-2 border relative',
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
            'px-4 py-2 rounded-xl text-fluid-xs font-semibold transition-all flex items-center gap-2 border',
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
          ) : friends.length === 0 ? (
            <div className="glass p-12 rounded-3xl border border-white/5 text-center">
              <Users size={48} className="mx-auto text-zinc-600 mb-3" />
              <h3 className="text-fluid-lg font-bold text-white mb-1">No friends added yet</h3>
              <p className="text-fluid-xs text-zinc-400 mb-4">
                Connect with friends to stay accountable, compare streaks, and share growth.
              </p>
              <GlassButton variant="primary" onClick={() => setIsAddModalOpen(true)}>
                <UserPlus size={14} className="mr-1.5" /> Find Friends
              </GlassButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friendship) => (
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
