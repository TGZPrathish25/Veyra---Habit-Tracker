/** AI module — unit tests. */
import { describe, it, expect } from 'vitest';
import { aiService } from './ai.service.js';

describe('AI Module', () => {
  const userId = 'demo-user-id';

  it('generates a structured monthly reflection with key highlights and next month focus', async () => {
    const res = await aiService.generateMonthlyReflection(userId, {
      year: 2026,
      month: 10,
      customPrompt: 'Focus on morning workout consistency and deep work sessions.',
    });

    expect(res).toBeDefined();
    expect(res.year).toBe(2026);
    expect(res.month).toBe(10);
    expect(res.reflection.length).toBeGreaterThan(50);
    expect(res.keyHighlights.length).toBeGreaterThan(0);
    expect(res.focusAreasNextMonth.length).toBeGreaterThan(0);
    expect(['triumphant', 'consistent', 'improving', 'needs_focus']).toContain(res.sentiment);
  });

  it('generates actionable productivity insights with summary score', async () => {
    const res = await aiService.getProductivityInsights(userId, 30);

    expect(res).toBeDefined();
    expect(res.insights.length).toBeGreaterThan(0);
    expect(res.summaryScore).toBeGreaterThanOrEqual(0);
    expect(res.summaryScore).toBeLessThanOrEqual(100);
    expect(res.weeklyPaceRecommendation).toBeDefined();

    const firstInsight = res.insights[0];
    expect(firstInsight.title).toBeDefined();
    expect(firstInsight.observation).toBeDefined();
    expect(firstInsight.actionableTip).toBeDefined();
  });
});
