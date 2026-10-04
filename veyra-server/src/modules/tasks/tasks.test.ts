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

  it('preserves past history and completed occurrences when a task is deleted', async () => {
    const task = await tasksService.createTask(testUserId, {
      title: 'Historical Task',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    });

    const pastDateStr = '2026-10-01';
    const pastOcc = await tasksRepository.createOccurrences([
      { taskId: task.id, userId: testUserId, date: new Date(pastDateStr) },
    ]);
    await tasksRepository.updateOccurrence(pastOcc[0].id, {
      completed: true,
      completedAt: new Date(),
      xpAwarded: 10,
    });

    // Delete the task today
    await tasksService.deleteTask(testUserId, task.id);

    // Verify that past occurrence still exists in database and repository
    const pastOccurrences = await tasksRepository.findOccurrencesByDate(testUserId, new Date(pastDateStr));
    const matchingPast = pastOccurrences.find((o) => o.taskId === task.id);
    expect(matchingPast).toBeDefined();
    expect(matchingPast?.completed).toBe(true);

    // And verify past daily occurrences still show it in past history
    const pastDaily = await tasksService.getDailyOccurrences(testUserId, pastDateStr, INDIA_TIMEZONE);
    expect(pastDaily.occurrences.some((o) => o.taskId === task.id)).toBe(true);
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
    expect(result1.xpDelta).toBe(15);

    // Toggle back to incomplete
    const result2 = await tasksService.toggleOccurrence(testUserId, occ.id, undefined, INDIA_TIMEZONE);
    expect(result2.occurrence.completed).toBe(false);
    expect(result2.occurrence.completedAt).toBeNull();
    expect(result2.xpDelta).toBe(-15);
  });

  it('prevents modifying occurrences from past dates once the day is over', async () => {
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

  it('allows completion after due time until day is over, giving less points (5 XP) vs on-time (15 XP)', async () => {
    // Task with an already passed due time today (00:00)
    const taskPassed = await tasksService.createTask(testUserId, {
      title: 'Early Morning Habit',
      emoji: '🌅',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      dueTime: '00:00',
    });

    const todayStr = getIndianTodayDateString();
    const res = await tasksService.getDailyOccurrences(testUserId, todayStr, INDIA_TIMEZONE);
    const occPassed = res.occurrences.find((o) => o.taskId === taskPassed.id)!;

    expect(occPassed.effectiveDueTime).toBe('00:00');
    // Rule 1: Not marked expired / not done until the day is over
    expect(occPassed.isExpired).toBe(false);

    // Rule 2: Completable, but awards less points (5 XP) for completion after time
    const lateToggle = await tasksService.toggleOccurrence(testUserId, occPassed.id, true, INDIA_TIMEZONE);
    expect(lateToggle.occurrence.completed).toBe(true);
    expect(lateToggle.occurrence.xpAwarded).toBe(5);
    expect(lateToggle.xpDelta).toBe(5);

    // Task with a future due time (23:59) awards more points (15 XP) before time
    const taskFuture = await tasksService.createTask(testUserId, {
      title: 'Late Night Reflection',
      emoji: '🌙',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      dueTime: '23:59',
    });

    const res2 = await tasksService.getDailyOccurrences(testUserId, todayStr, INDIA_TIMEZONE);
    const occFuture = res2.occurrences.find((o) => o.taskId === taskFuture.id)!;

    expect(occFuture.effectiveDueTime).toBe('23:59');
    expect(occFuture.isExpired).toBe(false);

    const onTimeToggle = await tasksService.toggleOccurrence(testUserId, occFuture.id, true, INDIA_TIMEZONE);
    expect(onTimeToggle.occurrence.completed).toBe(true);
    expect(onTimeToggle.occurrence.xpAwarded).toBe(15);
    expect(onTimeToggle.xpDelta).toBe(15);
  });
});

