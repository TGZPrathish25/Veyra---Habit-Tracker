/** Unit tests for AiProductivityInsightsCard component. */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AiProductivityInsightsCard } from '../AiProductivityInsightsCard';

// Mock useProductivityInsights hook
vi.mock('../../hooks/useAi', () => ({
  useProductivityInsights: () => ({
    insights: [
      {
        id: 'ins-1',
        category: 'schedule',
        title: 'Weekend Habit Dip Detected',
        observation: 'Your weekday completion rate averages 80%, but weekends drop.',
        actionableTip: 'Set a gentler weekend version of your habits.',
        impact: 'high',
      },
    ],
    summaryScore: 84,
    weeklyPaceRecommendation: 'Maintain steady momentum and focus on morning consistency.',
    isLoading: false,
    isError: false,
  }),
}));

describe('AiProductivityInsightsCard', () => {
  const queryClient = new QueryClient();

  it('renders productivity intelligence score, recommendation, and insights', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AiProductivityInsightsCard days={30} />
      </QueryClientProvider>
    );

    expect(screen.getByText('Productivity Intelligence')).toBeDefined();
    expect(screen.getByText('AI Coach')).toBeDefined();
    expect(screen.getByText('84/100')).toBeDefined();
    expect(
      screen.getByText('Maintain steady momentum and focus on morning consistency.')
    ).toBeDefined();
    expect(screen.getByText('Weekend Habit Dip Detected')).toBeDefined();
    expect(
      screen.getByText('Your weekday completion rate averages 80%, but weekends drop.')
    ).toBeDefined();
    expect(screen.getByText('💡 Set a gentler weekend version of your habits.')).toBeDefined();
  });
});
