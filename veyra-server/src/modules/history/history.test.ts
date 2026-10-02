/** History module unit tests — year/month tree and monthly snapshot views. */
import { describe, it, expect } from 'vitest';
import { historyService } from './history.service.js';

describe('History Module', () => {
  const userId = 'usr_test_history_user';

  it('retrieves the year/month archive tree for navigation', async () => {
    const tree = await historyService.getTree(userId);
    expect(Array.isArray(tree)).toBe(true);
    expect(tree.length).toBeGreaterThan(0);
    expect(tree[0]).toHaveProperty('year');
    expect(tree[0]).toHaveProperty('months');
    expect(tree[0].months.length).toBeGreaterThanOrEqual(1);

    const currentMonthNode = tree[0].months[0];
    expect(currentMonthNode).toBeDefined();
    expect(currentMonthNode.monthName).toBeDefined();
  });

  it('retrieves a month snapshot with structured properties', async () => {
    const snapshot = await historyService.getMonthSnapshot(userId, 2026, 9);
    expect(snapshot.year).toBe(2026);
    expect(snapshot.month).toBe(9);
    expect(snapshot.monthName).toBe('September');
    expect(snapshot).toHaveProperty('isLocked');
    expect(snapshot).toHaveProperty('tasksCompleted');
    expect(Array.isArray(snapshot.days)).toBe(true);
  });

  it('contains day-by-day checklist data in month snapshot', async () => {
    const snapshot = await historyService.getMonthSnapshot(userId, 2026, 10);
    expect(Array.isArray(snapshot.days)).toBe(true);
    expect(snapshot.days.length).toBe(31); // October has 31 days

    const day1 = snapshot.days[0];
    expect(day1.dayNumber).toBe(1);
    expect(day1.date).toBe('2026-10-01');
    expect(['completed', 'partial', 'missed']).toContain(day1.status);
    expect(Array.isArray(day1.tasks)).toBe(true);
  });
});
