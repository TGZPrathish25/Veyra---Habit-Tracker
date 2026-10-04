/** Unit tests for the 1-hour task due reminder scheduler. */
import { describe, it, expect, beforeAll } from 'vitest';
import { runTaskDueReminder } from './taskDueReminder.job.js';
import { tasksRepository } from '../modules/tasks/tasks.repository.js';
import { notificationsRepository } from '../modules/notifications/notifications.repository.js';
import { usersRepository } from '../modules/users/users.repository.js';
import { persistentStore } from '../db/persistentStore.js';

describe('1-Hour Task Due Reminder Job', () => {
  const testUserId = 'usr_test_one_hour_user';
  const testDate = '2026-10-04';

  beforeAll(async () => {
    await persistentStore.saveUser({
      id: testUserId,
      firebaseUid: 'uid_test_one_hour',
      email: 'onehour@test.com',
      name: 'Task Time Master',
      username: 'time_master',
      avatarUrl: null,
      timezone: 'Asia/Kolkata',
      xp: 250,
      level: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it('sends a 1-hour deadline reminder for an uncompleted task due in ~60 minutes', async () => {
    const task = await tasksRepository.createTask(testUserId, {
      title: 'Math Study Session',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      dueTime: '17:00',
    });

    const [occ] = await tasksRepository.createOccurrences([
      { taskId: task.id, userId: testUserId, date: new Date(testDate) },
    ]);

    // Force diffMinutes to 58 (within 50-65 min window)
    const result = await runTaskDueReminder(testDate, testUserId, 58);
    expect(result.remindersSent).toBe(1);

    const notifs = await notificationsRepository.findUserNotifications(testUserId, false, 5);
    const reminderNotif = notifs.find(
      (n) => (n.data as any)?.scheduledNotification === 'task_due_reminder' && (n.data as any)?.occurrenceId === occ.id
    );

    expect(reminderNotif).toBeDefined();
    expect(reminderNotif?.title).toBe('⏰ 1 Hour Left: Math Study Session');
    expect(reminderNotif?.body).toContain('Math Study Session');
    expect(reminderNotif?.body).toContain('is due at 17:00. Complete it on-time for +15 XP!');
  });

  it('skips duplicate reminder for the same task occurrence on the same day', async () => {
    const result = await runTaskDueReminder(testDate, testUserId, 58);
    expect(result.remindersSent).toBe(0);
    expect(result.skippedAlreadySent).toBe(1);
  });

  it('skips completed tasks', async () => {
    const task2 = await tasksRepository.createTask(testUserId, {
      title: 'Gym Workout',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      dueTime: '18:00',
    });

    const [occ2] = await tasksRepository.createOccurrences([
      { taskId: task2.id, userId: testUserId, date: new Date(testDate) },
    ]);

    await tasksRepository.updateOccurrence(occ2.id, {
      completed: true,
      completedAt: new Date(),
      xpAwarded: 15,
    });

    const result = await runTaskDueReminder(testDate, testUserId, 60);
    expect(result.remindersSent).toBe(0);
  });

  it('skips reminder when taskDueReminder is turned off in user settings', async () => {
    const disabledUserId = 'usr_test_disabled_task_reminder';
    await persistentStore.saveUser({
      id: disabledUserId,
      firebaseUid: 'uid_test_disabled_task',
      email: 'taskdisabled@test.com',
      name: 'Muted User',
      username: 'muted_user',
      avatarUrl: null,
      timezone: 'Asia/Kolkata',
      xp: 100,
      level: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await usersRepository.updateSettings(disabledUserId, {
      notificationPrefs: { taskDueReminder: false } as any,
    });

    const task = await tasksRepository.createTask(disabledUserId, {
      title: 'Quiet Habit',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      dueTime: '19:00',
    });

    await tasksRepository.createOccurrences([
      { taskId: task.id, userId: disabledUserId, date: new Date(testDate) },
    ]);

    const result = await runTaskDueReminder(testDate, disabledUserId, 60);
    expect(result.remindersSent).toBe(0);
  });
});
