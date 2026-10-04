/** Unit tests for the 9:10 PM IST daily habit completion reminder scheduler. */
import { describe, it, expect, beforeAll } from 'vitest';
import { runDailyCompletionReminder } from './dailyCompletionReminder.job.js';
import { tasksRepository } from '../modules/tasks/tasks.repository.js';
import { notificationsRepository } from '../modules/notifications/notifications.repository.js';
import { persistentStore } from '../db/persistentStore.js';

describe('9:10 PM IST Daily Completion Reminder Job', () => {
  const testUserId = 'usr_test_ist_reminder';
  const testDate = '2026-10-04';

  beforeAll(async () => {
    // Seed test user into persistent store
    await persistentStore.saveUser({
      id: testUserId,
      firebaseUid: 'uid_test_ist_reminder',
      email: 'ist_reminder@test.com',
      name: 'IST Adventurer',
      username: 'ist_adv',
      avatarUrl: null,
      timezone: 'Asia/Kolkata',
      xp: 400,
      level: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it('sends reminder mentioning uncompleted percentage when habits are partially done', async () => {
    // Create 2 tasks for user
    const task1 = await tasksRepository.createTask(testUserId, {
      title: 'Morning Meditation',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      dueTime: '08:00',
    });

    const task2 = await tasksRepository.createTask(testUserId, {
      title: 'Evening Reading',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      dueTime: '20:30',
    });

    // Create occurrences for test date
    const created = await tasksRepository.createOccurrences([
      { taskId: task1.id, userId: testUserId, date: new Date(testDate) },
      { taskId: task2.id, userId: testUserId, date: new Date(testDate) },
    ]);

    await tasksRepository.updateOccurrence(created[0].id, {
      completed: true,
      completedAt: new Date(),
      xpAwarded: 10,
    });

    // Run the reminder job for this user and test date
    const result = await runDailyCompletionReminder(testDate, testUserId);
    expect(result.notificationsSent).toBe(1);

    // Verify created notification content
    const notifs = await notificationsRepository.findUserNotifications(testUserId, false, 5);
    const reminderNotif = notifs.find(
      (n) => (n.data as any)?.scheduledNotification === 'evening_910pm_ist' && (n.data as any)?.date === testDate
    );

    expect(reminderNotif).toBeDefined();
    // 1 of 2 completed = 50% completed, 50% not completed
    expect(reminderNotif?.title).toContain('50% Not Completed Today');
    expect(reminderNotif?.body).toContain('1/2 habits done (50% left)');
  });

  it('skips duplicate notification on the same day', async () => {
    // Running again for the same date and user should skip
    const result = await runDailyCompletionReminder(testDate, testUserId);
    expect(result.notificationsSent).toBe(0);
    expect(result.skippedAlreadySent).toBe(1);
  });

  it('sends 100% perfect completion notification when all tasks are complete', async () => {
    const perfectUserId = 'usr_test_perfect_ist';
    const perfectDate = '2026-10-05';

    await persistentStore.saveUser({
      id: perfectUserId,
      firebaseUid: 'uid_perfect_ist',
      email: 'perfect@test.com',
      name: 'Perfect Hero',
      username: 'perfect_hero',
      avatarUrl: null,
      timezone: 'Asia/Kolkata',
      xp: 800,
      level: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const task = await tasksRepository.createTask(perfectUserId, {
      title: 'Daily Workout',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      dueTime: '18:00',
    });

    const created = await tasksRepository.createOccurrences([
      { taskId: task.id, userId: perfectUserId, date: new Date(perfectDate) },
    ]);

    await tasksRepository.updateOccurrence(created[0].id, {
      completed: true,
      completedAt: new Date(),
      xpAwarded: 10,
    });

    const result = await runDailyCompletionReminder(perfectDate, perfectUserId);
    expect(result.notificationsSent).toBe(1);

    const notifs = await notificationsRepository.findUserNotifications(perfectUserId, false, 5);
    const reminderNotif = notifs.find(
      (n) => (n.data as any)?.scheduledNotification === 'evening_910pm_ist' && (n.data as any)?.date === perfectDate
    );

    expect(reminderNotif).toBeDefined();
    expect(reminderNotif?.title).toContain('100% Completed — Perfect Day!');
    expect(reminderNotif?.body).toContain('all 1 habits today');
  });
});
