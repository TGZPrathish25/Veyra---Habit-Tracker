import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FriendCard } from '../FriendCard';
import type { Friendship } from '../../types';

describe('FriendCard', () => {
  const mockFriendship: Friendship = {
    id: 'fship-1',
    userId: 'user-1',
    friendId: 'friend-1',
    privacyLevel: 'detailed',
    createdAt: '2026-10-01T10:00:00Z',
    friend: {
      id: 'friend-1',
      name: 'Maya Chen',
      username: 'mayachen',
      avatarUrl: null,
      level: 5,
      totalXp: 2100,
      currentStreak: 14,
    },
  };

  it('renders friend info, level, streak, and privacy badge', () => {
    const onViewProgress = vi.fn();
    const onUpdatePrivacy = vi.fn();
    const onRemove = vi.fn();

    render(
      <FriendCard
        friendship={mockFriendship}
        onViewProgress={onViewProgress}
        onUpdatePrivacy={onUpdatePrivacy}
        onRemove={onRemove}
      />
    );

    expect(screen.getByText('Maya Chen')).toBeInTheDocument();
    expect(screen.getByText('@mayachen')).toBeInTheDocument();
    expect(screen.getByText('Lv. 5')).toBeInTheDocument();
    expect(screen.getByText('14d')).toBeInTheDocument();
    expect(screen.getByText('L3: Detailed')).toBeInTheDocument();
  });

  it('triggers onViewProgress when clicking view progress button', () => {
    const onViewProgress = vi.fn();
    const onUpdatePrivacy = vi.fn();
    const onRemove = vi.fn();

    render(
      <FriendCard
        friendship={mockFriendship}
        onViewProgress={onViewProgress}
        onUpdatePrivacy={onUpdatePrivacy}
        onRemove={onRemove}
      />
    );

    const button = screen.getByText('View Accountability Progress');
    fireEvent.click(button);
    expect(onViewProgress).toHaveBeenCalledWith('friend-1');
  });
});
