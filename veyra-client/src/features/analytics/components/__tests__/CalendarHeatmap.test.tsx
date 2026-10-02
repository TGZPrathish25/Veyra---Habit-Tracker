/** Unit tests for CalendarHeatmap component. */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CalendarHeatmap } from '../CalendarHeatmap';
import type { HeatmapDay } from '../../types';

describe('CalendarHeatmap', () => {
  const mockHeatmapData: HeatmapDay[] = [
    { date: '2026-10-01', count: 0, level: 0 },
    { date: '2026-10-02', count: 1, level: 1 },
    { date: '2026-10-03', count: 3, level: 2 },
    { date: '2026-10-04', count: 5, level: 3 },
    { date: '2026-10-05', count: 8, level: 4 },
  ];

  it('renders heatmap days and legend properly', () => {
    const { container } = render(<CalendarHeatmap data={mockHeatmapData} />);

    expect(screen.getByText('Less')).toBeDefined();
    expect(screen.getByText('More')).toBeDefined();

    // Check that title tooltips exist on the rendered cells
    const cell = container.querySelector('[title="2026-10-05: 8 habits completed (Level 4)"]');
    expect(cell).toBeDefined();
  });
});
