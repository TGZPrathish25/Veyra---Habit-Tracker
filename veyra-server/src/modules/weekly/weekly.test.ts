/** Weekly planning unit tests. */
import { describe, it, expect } from 'vitest';
import { weeklyService, getWeekMondayDate } from './weekly.service.js';
import { ForbiddenError } from '../../lib/errors.js';

describe('Weekly Planning Module', () => {
  const testUserId = 'usr_test_weekly_user';

  it('calculates the correct Monday for a given date', () => {
    // 2026-10-02 is a Friday -> Monday was 2026-09-28
    const monday = getWeekMondayDate('2026-10-02');
    expect(monday.toISOString().split('T')[0]).toBe('2026-09-28');
  });

  it('gets or initializes a weekly plan for the current week', async () => {
    const plan = await weeklyService.getCurrentPlan(testUserId, '2026-09-28');
    expect(plan).toBeDefined();
    expect(plan.userId).toBe(testUserId);
    expect(plan.weekStart).toBe('2026-09-28');
    expect(plan.isLocked).toBe(false);
  });

  it('saves and updates weekly goals and reflections', async () => {
    const saved = await weeklyService.savePlan(testUserId, {
      weekStart: '2026-09-28',
      goals: [
        {
          id: 'g1',
          title: 'Complete 5 workouts',
          targetCount: 5,
          completedCount: 2,
        },
      ],
      reflection: 'Good start to the week',
    });

    expect(saved.goals.length).toBe(1);
    expect(saved.goals[0].title).toBe('Complete 5 workouts');
    expect(saved.reflection).toBe('Good start to the week');

    const updated = await weeklyService.updatePlan(testUserId, saved.id, {
      reflection: 'Finished 4 workouts out of 5',
    });
    expect(updated.reflection).toBe('Finished 4 workouts out of 5');
  });

  it('prevents editing a locked weekly plan', async () => {
    const saved = await weeklyService.savePlan(testUserId, {
      weekStart: '2026-09-21',
      goals: [],
    });

    await weeklyService.updatePlan(testUserId, saved.id, { isLocked: true });

    await expect(
      weeklyService.savePlan(testUserId, {
        weekStart: '2026-09-21',
        goals: [{ id: 'g2', title: 'New Goal', targetCount: 1, completedCount: 0 }],
      })
    ).rejects.toThrow(ForbiddenError);
  });
});
