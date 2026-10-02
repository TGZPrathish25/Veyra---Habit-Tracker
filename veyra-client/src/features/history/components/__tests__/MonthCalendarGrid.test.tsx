/** Unit tests for MonthCalendarGrid component. */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MonthCalendarGrid } from '../MonthCalendarGrid';
import type { DayHistory } from '../../types';

describe('MonthCalendarGrid', () => {
  const mockDays: DayHistory[] = [
    {
      date: '2026-10-01',
      dayNumber: 1,
      dayOfWeek: 'Thu',
      completedCount: 3,
      totalCount: 3,
      status: 'completed',
      tasks: [
        { title: 'Morning Run', emoji: '🏃', completed: true },
        { title: 'Read 20 pages', emoji: '📚', completed: true },
        { title: 'Meditate', emoji: '🧘', completed: true },
      ],
    },
    {
      date: '2026-10-02',
      dayNumber: 2,
      dayOfWeek: 'Fri',
      completedCount: 1,
      totalCount: 3,
      status: 'partial',
      tasks: [
        { title: 'Morning Run', emoji: '🏃', completed: true },
        { title: 'Read 20 pages', emoji: '📚', completed: false },
        { title: 'Meditate', emoji: '🧘', completed: false },
      ],
    },
  ];

  it('renders days and triggers onSelectDay when clicked', () => {
    const handleSelectDay = vi.fn();
    render(<MonthCalendarGrid days={mockDays} onSelectDay={handleSelectDay} />);

    // Check weekday headers
    expect(screen.getByText('Sun')).toBeDefined();
    expect(screen.getByText('Mon')).toBeDefined();
    expect(screen.getByText('Thu')).toBeDefined();

    // Check day numbers
    const ones = screen.getAllByText('1');
    expect(ones.length).toBeGreaterThan(0);
    expect(screen.getByText('2')).toBeDefined();

    // Click on day 1
    const day1Button = ones[0].closest('button');
    expect(day1Button).toBeDefined();
    if (day1Button) {
      fireEvent.click(day1Button);
      expect(handleSelectDay).toHaveBeenCalledTimes(1);
      expect(handleSelectDay).toHaveBeenCalledWith(mockDays[0]);
    }
  });
});
