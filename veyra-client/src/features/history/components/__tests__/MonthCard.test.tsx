/** Unit tests for MonthCard component. */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { MonthCard } from '../MonthCard';
import type { MonthNode } from '../../types';

describe('MonthCard', () => {
  const mockLockedMonth: MonthNode = {
    year: 2026,
    month: 9,
    monthName: 'September',
    isLocked: true,
    tasksCompleted: 45,
    totalTasks: 50,
    completionRate: 90,
    xpEarned: 650,
  };

  const mockActiveMonth: MonthNode = {
    year: 2026,
    month: 10,
    monthName: 'October',
    isLocked: false,
    tasksCompleted: 12,
    totalTasks: 20,
    completionRate: 60,
    xpEarned: 180,
  };

  it('renders locked month snapshot details correctly', () => {
    render(
      <MemoryRouter>
        <MonthCard month={mockLockedMonth} />
      </MemoryRouter>
    );

    expect(screen.getByText('September 2026')).toBeDefined();
    expect(screen.getByText('September')).toBeDefined();
    expect(screen.getByText('Locked Archive')).toBeDefined();
    expect(screen.getByText('90%')).toBeDefined();
    expect(screen.getByText('45')).toBeDefined();
    expect(screen.getByText('+650')).toBeDefined();
    expect(screen.getByText('View Month Breakdown')).toBeDefined();
  });

  it('renders active month badge correctly', () => {
    render(
      <MemoryRouter>
        <MonthCard month={mockActiveMonth} />
      </MemoryRouter>
    );

    expect(screen.getByText('October 2026')).toBeDefined();
    expect(screen.getByText('Active Month')).toBeDefined();
    expect(screen.getByText('60%')).toBeDefined();
    expect(screen.getByText('+180')).toBeDefined();
  });
});
