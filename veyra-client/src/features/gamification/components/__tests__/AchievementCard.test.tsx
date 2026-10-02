import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AchievementCard } from '../AchievementCard';
import type { Achievement } from '../../types';

describe('AchievementCard', () => {
  const unlockedAchievement: Achievement = {
    id: 'ach-1',
    key: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    xpReward: 100,
    category: 'streaks',
    unlocked: true,
    unlockedAt: '2026-10-02T10:00:00.000Z',
  };

  const lockedAchievement: Achievement = {
    id: 'ach-2',
    key: 'streak_30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    xpReward: 500,
    category: 'streaks',
    unlocked: false,
    unlockedAt: null,
  };

  it('renders unlocked achievement with reward and unlocked badge', () => {
    render(<AchievementCard achievement={unlockedAchievement} />);
    expect(screen.getByText('Week Warrior')).toBeInTheDocument();
    expect(screen.getByText('Maintain a 7-day streak')).toBeInTheDocument();
    expect(screen.getByText('+100 XP')).toBeInTheDocument();
    expect(screen.getByText(/Unlocked/)).toBeInTheDocument();
  });

  it('renders locked achievement with locked indicator', () => {
    render(<AchievementCard achievement={lockedAchievement} />);
    expect(screen.getByText('Monthly Master')).toBeInTheDocument();
    expect(screen.getByText('Locked')).toBeInTheDocument();
  });
});
