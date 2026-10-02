/** Daily recurring task CRUD, occurrences, completion toggle — unit tests. */
import { describe, it, expect, beforeEach } from 'vitest';
import { tasksService } from './tasks.service.js';
import { tasksRepository } from './tasks.repository.js';
import { ForbiddenError } from '../../lib/errors.js';
import { getIndianTodayDateString, INDIA_TIMEZONE, shiftDateString } from '../../lib/time.js';

describe('Tasks Module', () => {
  const testUserId = 'usr_test_user_tasks';

  beforeEach(async () => {
    // Clean up or prepare test user tasks
  });

  it('creates and lists recurring tasks for a user', async () => {
    const created = await tasksService.createTask(testUserId, {
      title: 'Morning Meditation',
      description: '10 minutes mindful breathing',
      emoji: '🧘',
      color: '#8b5cf6',
      isRecurring: true,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    });

    expect(created).toBeDefined();
    expect(created.title).toBe('Morning Meditation');
    expect(created.emoji).toBe('🧘');
    expect(created.userId).toBe(testUserId);
    expect(created.isActive).toBe(true);

    const tasks = await tasksService.getTasks(testUserId);
    expect(tasks.some((t) => t.id === created.id)).toBe(true);
  });

  it('updates an existing task', async () => {
    const task = await tasksService.createTask(testUserId, {
      title: 'Read Book',
      emoji: '📚',
    });

    const updated = await tasksService.updateTask(testUserId, task.id, {
      title: 'Read 20 Pages of Book',
      description: 'Atomic Habits',
    });

    expect(updated.title).toBe('Read 20 Pages of Book');
    expect(updated.description).toBe('Atomic Habits');
  });

  it('deletes (deactivates) a task and removes its occurrences from daily view', async () => {
    const task = await tasksService.createTask(testUserId, {
      title: 'Workout To Delete',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    });

    const todayStr = getIndianTodayDateString();
    const beforeDelete = await tasksService.getDailyOccurrences(testUserId, todayStr, INDIA_TIMEZONE);
    expect(beforeDelete.occurrences.some((o) => o.taskId === task.id)).toBe(true);

    await tasksService.deleteTask(testUserId, task.id);
    const tasks = await tasksService.getTasks(testUserId);
    expect(tasks.some((t) => t.id === task.id)).toBe(false);

    const afterDelete = await tasksService.getDailyOccurrences(testUserId, todayStr, INDIA_TIMEZONE);
    expect(afterDelete.occurrences.some((o) => o.taskId === task.id)).toBe(false);
  });

  it('creates a task and ensures it appears exactly once in daily occurrences without duplicates', async () => {
    const task = await tasksService.createTask(testUserId, {
      title: 'Unique Task Check',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    });

    const todayStr = getIndianTodayDateString();
    const res1 = await tasksService.getDailyOccurrences(testUserId, todayStr, INDIA_TIMEZONE);
    const res2 = await tasksService.getDailyOccurrences(testUserId, todayStr, INDIA_TIMEZONE);

    const matching1 = res1.occurrences.filter((o) => o.taskId === task.id);
    const matching2 = res2.occurrences.filter((o) => o.taskId === task.id);

    expect(matching1.length).toBe(1);
    expect(matching2.length).toBe(1);
  });

  it('lazily generates occurrences for active tasks on target date', async () => {
    const task = await tasksService.createTask(testUserId, {
      title: 'Drink 2L Water',
      emoji: '💧',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    });

    const todayStr = getIndianTodayDateString();
    const res = await tasksService.getDailyOccurrences(testUserId, todayStr, INDIA_TIMEZONE);

    expect(res.date).toBe(todayStr);
    expect(res.occurrences.length).toBeGreaterThan(0);
    const occurrence = res.occurrences.find((o) => o.taskId === task.id);
    expect(occurrence).toBeDefined();
    expect(occurrence?.completed).toBe(false);
  });

  it('toggles task completion and awards XP', async () => {
    const task = await tasksService.createTask(testUserId, {
      title: 'Evening Walk',
      emoji: '🚶',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    });

    const todayStr = getIndianTodayDateString();
    const initial = await tasksService.getDailyOccurrences(testUserId, todayStr, INDIA_TIMEZONE);
    const occ = initial.occurrences.find((o) => o.taskId === task.id)!;
    expect(occ.completed).toBe(false);

    // Toggle to completed
    const result1 = await tasksService.toggleOccurrence(testUserId, occ.id, undefined, INDIA_TIMEZONE);
    expect(result1.occurrence.completed).toBe(true);
    expect(result1.occurrence.completedAt).toBeDefined();
    expect(result1.xpDelta).toBe(10);

    // Toggle back to incomplete
    const result2 = await tasksService.toggleOccurrence(testUserId, occ.id, undefined, INDIA_TIMEZONE);
    expect(result2.occurrence.completed).toBe(false);
    expect(result2.occurrence.completedAt).toBeNull();
    expect(result2.xpDelta).toBe(-10);
  });

  it('prevents modifying occurrences from past dates', async () => {
    const pastDateStr = shiftDateString(getIndianTodayDateString(), -3, INDIA_TIMEZONE);

    const task = await tasksService.createTask(testUserId, {
      title: 'Historical Task',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    });

    const pastRes = await tasksService.getDailyOccurrences(testUserId, pastDateStr, INDIA_TIMEZONE);
    const pastOcc = pastRes.occurrences.find((o) => o.taskId === task.id)!;

    await expect(
      tasksService.toggleOccurrence(testUserId, pastOcc.id, true, INDIA_TIMEZONE)
    ).rejects.toThrow(ForbiddenError);
  });
});
