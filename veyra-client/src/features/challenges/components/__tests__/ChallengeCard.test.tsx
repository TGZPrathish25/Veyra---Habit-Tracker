import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ChallengeCard } from '../ChallengeCard';
import type { Challenge } from '../../types';

describe('ChallengeCard', () => {
  const mockChallenge: Challenge = {
    id: 'chal-1',
    creatorId: 'user-1',
    creatorName: 'Alex Rivera',
    title: '30-Day Morning Habit Sprint',
    description: 'Wake up early and complete 3 morning habits',
    type: 'daily_streak',
    targetValue: 30,
    rewardXp: 350,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    participantCount: 5,
    isPublic: true,
    createdAt: '2026-10-01T00:00:00Z',
    isJoined: true,
    userProgress: 15,
  };

  it('renders challenge title, reward XP, type, and user progress', () => {
    renderWithProviders(<ChallengeCard challenge={mockChallenge} />);

    expect(screen.getByText('30-Day Morning Habit Sprint')).toBeInTheDocument();
    expect(screen.getByText('+350 XP')).toBeInTheDocument();
    expect(screen.getByText('Daily Streak')).toBeInTheDocument();
    expect(screen.getByText('Your Progress')).toBeInTheDocument();
    expect(screen.getByText(/15 \/ 30/)).toBeInTheDocument();
    expect(screen.getByText('(50%)')).toBeInTheDocument();
  });
});
