import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LevelProgressBar } from '../LevelProgressBar';

describe('LevelProgressBar', () => {
  it('renders level, XP values, and remaining percentage in detailed mode', () => {
    render(
      <LevelProgressBar
        level={3}
        currentLevelXp={150}
        nextLevelXp={600}
        progressPercentage={25}
        totalXp={750}
      />
    );

    expect(screen.getByText('Level 3 Adventurer')).toBeInTheDocument();
    expect(screen.getByText('750 Total XP')).toBeInTheDocument();
    expect(screen.getByText(/150 \/ 600/)).toBeInTheDocument();
    expect(screen.getByText('75% remaining')).toBeInTheDocument();
  });

  it('renders compact version correctly', () => {
    render(
      <LevelProgressBar
        level={2}
        currentLevelXp={100}
        nextLevelXp={400}
        progressPercentage={25}
        compact
      />
    );

    expect(screen.getByText('Lv. 2')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });
});
