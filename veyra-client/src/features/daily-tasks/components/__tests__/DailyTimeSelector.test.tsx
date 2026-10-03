/** Unit tests for DailyTimeSelector component. */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DailyTimeSelector } from '../DailyTimeSelector';

describe('DailyTimeSelector', () => {
  const defaultProps = {
    hasEndTime: true,
    onToggleHasEndTime: vi.fn(),
    dueTime: '21:00',
    onDueTimeChange: vi.fn(),
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    customizePerDay: false,
    onToggleCustomizePerDay: vi.fn(),
    dayDueTimes: {},
    onDayDueTimesChange: vi.fn(),
  };

  it('renders header, digital display, and preset options when enabled', () => {
    render(<DailyTimeSelector {...defaultProps} />);

    expect(screen.getByText('Daily Deadline / Cut-off')).toBeInTheDocument();
    expect(screen.getByText('Quick Time Presets')).toBeInTheDocument();
    expect(screen.getByText('Morning')).toBeInTheDocument();
    expect(screen.getByText('Night')).toBeInTheDocument();
    expect(screen.getAllByText('9:00 PM').length).toBeGreaterThan(0);
  });

  it('calls onDueTimeChange when a quick preset card is clicked', () => {
    const handleDueTimeChange = vi.fn();
    render(<DailyTimeSelector {...defaultProps} onDueTimeChange={handleDueTimeChange} />);

    const morningButton = screen.getByText('Morning').closest('button');
    expect(morningButton).not.toBeNull();
    fireEvent.click(morningButton!);

    expect(handleDueTimeChange).toHaveBeenCalledWith('09:00');
  });

  it('calls onDueTimeChange when minute quick pills are clicked', () => {
    const handleDueTimeChange = vi.fn();
    render(<DailyTimeSelector {...defaultProps} onDueTimeChange={handleDueTimeChange} />);

    const min30Button = screen.getByText(':30');
    fireEvent.click(min30Button);

    expect(handleDueTimeChange).toHaveBeenCalledWith('21:30');
  });

  it('allows toggling per-day custom schedule', () => {
    const handleTogglePerDay = vi.fn();
    render(
      <DailyTimeSelector
        {...defaultProps}
        customizePerDay={false}
        onToggleCustomizePerDay={handleTogglePerDay}
      />
    );

    const toggleButton = screen.getByText('Customize end time per day');
    fireEvent.click(toggleButton);

    expect(handleTogglePerDay).toHaveBeenCalledWith(true);
  });

  it('renders days matrix when customizePerDay is active', () => {
    render(
      <DailyTimeSelector
        {...defaultProps}
        customizePerDay={true}
        selectedDays={[1, 2, 3]}
      />
    );

    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
    expect(screen.getByText('Wednesday')).toBeInTheDocument();
  });
});
