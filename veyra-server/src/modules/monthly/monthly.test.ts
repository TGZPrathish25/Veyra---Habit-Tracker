/** Monthly goals unit tests. */
import { describe, it, expect } from 'vitest';
import { monthlyService } from './monthly.service.js';
import { ForbiddenError } from '../../lib/errors.js';

describe('Monthly Goals Module', () => {
  const testUserId = 'usr_test_monthly_user';

  it('gets or initializes a monthly plan for the current month', async () => {
    const plan = await monthlyService.getCurrentPlan(testUserId, 2026, 10);
    expect(plan).toBeDefined();
    expect(plan.userId).toBe(testUserId);
    expect(plan.year).toBe(2026);
    expect(plan.month).toBe(10);
    expect(plan.isLocked).toBe(false);
  });

  it('saves and updates monthly goals', async () => {
    const plan = await monthlyService.savePlan(testUserId, {
      year: 2026,
      month: 10,
      goals: [
        {
          id: 'mg1',
          title: 'Run 100km total',
          targetCount: 100,
          completedCount: 25,
        },
      ],
      reflection: 'Focusing on cardio this month',
    });

    expect(plan.goals.length).toBe(1);
    expect(plan.goals[0].title).toBe('Run 100km total');

    const updated = await monthlyService.updatePlan(testUserId, plan.id, {
      goals: [
        {
          id: 'mg1',
          title: 'Run 100km total',
          targetCount: 100,
          completedCount: 50,
        },
      ],
    });
    expect(updated.goals[0].completedCount).toBe(50);
  });

  it('locks a month and creates an immutable snapshot', async () => {
    await monthlyService.savePlan(testUserId, {
      year: 2026,
      month: 9,
      goals: [
        { id: 'mg_past', title: 'Complete reading book', targetCount: 1, completedCount: 1, completed: true },
      ],
    });

    const result = await monthlyService.lockMonth(testUserId, 2026, 9, {
      tasksCompleted: 28,
      totalTasks: 30,
      streakDays: 28,
    });

    expect(result.plan.isLocked).toBe(true);
    expect(result.snapshot.tasksCompleted).toBe(28);
    expect(result.snapshot.completionRate).toBeGreaterThan(90);

    // Editing after locking should be forbidden
    await expect(
      monthlyService.savePlan(testUserId, {
        year: 2026,
        month: 9,
        goals: [],
      })
    ).rejects.toThrow(ForbiddenError);
  });
});
