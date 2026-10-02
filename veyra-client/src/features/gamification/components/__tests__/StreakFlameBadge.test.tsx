import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreakFlameBadge } from '../StreakFlameBadge';

describe('StreakFlameBadge', () => {
  it('renders active streak count correctly', () => {
    render(<StreakFlameBadge currentStreak={5} longestStreak={10} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('days')).toBeInTheDocument();
  });

  it('renders single day label as "day"', () => {
    render(<StreakFlameBadge currentStreak={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('day')).toBeInTheDocument();
  });

  it('handles zero streak inactive state', () => {
    render(<StreakFlameBadge currentStreak={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders best streak badge in large size', () => {
    render(<StreakFlameBadge currentStreak={7} longestStreak={14} size="lg" />);
    expect(screen.getByText('Best: 14d')).toBeInTheDocument();
  });
});
