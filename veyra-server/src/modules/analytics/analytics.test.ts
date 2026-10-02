/** Analytics module unit tests — trends, weekday breakdowns, category distributions, and heatmap. */
import { describe, it, expect } from 'vitest';
import { analyticsService } from './analytics.service.js';

describe('Analytics Module', () => {
  const userId = 'usr_test_analytics_user';

  it('computes 30-day analytics summary with trends and KPIs', async () => {
    const summary = await analyticsService.getSummary(userId, '30d');
    expect(summary.period).toBe('30d');
    expect(summary.averageCompletionRate).toBeGreaterThanOrEqual(0);
    expect(summary.totalTasksCompleted).toBeGreaterThanOrEqual(0);
    expect(summary.totalTasksScheduled).toBeGreaterThanOrEqual(0);
    expect(summary.topProductiveDay).toBeDefined();

    expect(Array.isArray(summary.trends)).toBe(true);
    expect(summary.trends.length).toBe(30);
    expect(summary.trends[0]).toHaveProperty('date');
    expect(summary.trends[0]).toHaveProperty('completionRate');
  });

  it('computes 7-day analytics summary with 7 trend points', async () => {
    const summary = await analyticsService.getSummary(userId, '7d');
    expect(summary.period).toBe('7d');
    expect(summary.trends.length).toBe(7);
  });

  it('provides weekday breakdown across all 7 days', async () => {
    const summary = await analyticsService.getSummary(userId, '30d');
    expect(summary.weekdayBreakdown.length).toBe(7);
    const dayNames = summary.weekdayBreakdown.map((w) => w.day);
    expect(dayNames).toContain('Mon');
    expect(dayNames).toContain('Tue');
    expect(dayNames).toContain('Wed');
  });

  it('provides habit category distribution', async () => {
    const summary = await analyticsService.getSummary(userId, '30d');
    expect(Array.isArray(summary.categoryDistribution)).toBe(true);
  });

  it('generates calendar heatmap data points', async () => {
    const heatmap = await analyticsService.getHeatmap(userId, 30);
    expect(Array.isArray(heatmap)).toBe(true);
    expect(heatmap.length).toBe(30);
    expect(heatmap[0]).toHaveProperty('date');
    expect(heatmap[0]).toHaveProperty('level');
    expect([0, 1, 2, 3, 4]).toContain(heatmap[0].level);
  });
});
