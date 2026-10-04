/**
 * 1-Hour Task Due Reminder Job.
 * Evaluates active habit occurrences for today and dispatches an urgent reminder notification
 * 1 hour before each task's scheduled due time, alerting the user to complete it on-time for full points.
 */
import cron from 'node-cron';
import { prisma, tryPrisma } from '../db/prisma.js';
import { persistentStore } from '../db/persistentStore.js';
import { tasksService } from '../modules/tasks/tasks.service.js';
import { notificationsRepository } from '../modules/notifications/notifications.repository.js';
import { usersRepository } from '../modules/users/users.repository.js';
import { logger } from '../config/logger.js';
import { getIO } from '../sockets/index.js';

const BANNED_PATTERNS = [
  'mayachen', 'sam_t', 'samtaylor', 'alex_r', 'alexrivera',
  'jordan_lee', 'jordanlee', 'sarah_k', 'sarahkim',
  'elena_r', 'marcus_v', 'priya_s', 'demo'
];
const BANNED_IDS = [
  'usr_mayachen', 'usr_samtaylor', 'usr_alexrivera', 'usr_jordanlee', 'usr_sarahkim',
  'usr_elena_r', 'usr_marcus_v', 'usr_priya_sharma', 'usr_demo', 'demo', 'mock'
];
const BANNED_NAMES = [
  'sarah kim', 'jordan lee', 'alex rivera', 'sam taylor', 'maya chen',
  'elena rostova', 'marcus vance', 'priya sharma', 'demo user'
];

function isDummyUser(u: { id?: string; username?: string | null; email?: string | null; name?: string | null }): boolean {
  if (!u) return true;
  if (u.id && BANNED_IDS.includes(u.id)) return true;
  const uName = u.username?.toLowerCase().trim() || '';
  const name = u.name?.toLowerCase().trim() || '';
  if (BANNED_PATTERNS.some((p) => uName === p || (p === 'demo' && uName.includes('demo')))) return true;
  if (BANNED_NAMES.some((n) => name === n)) return true;
  if (u.email && u.email.toLowerCase().includes('demo@')) return true;
  return false;
}

export interface TaskDueReminderResult {
  targetDate: string;
  totalUsersEvaluated: number;
  remindersSent: number;
  skippedAlreadySent: number;
}

/**
 * Evaluates tasks due in approximately 1 hour and sends reminder notifications.
 * Accepts optional parameters for unit testing and deterministic checks.
 */
export async function runTaskDueReminder(
  forceDate?: string,
  specificUserId?: string,
  forceDiffMinutes?: number
): Promise<TaskDueReminderResult> {
  const now = new Date();
  const targetDate =
    forceDate ||
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);

  // Time in Asia/Kolkata
  const nowParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);

  const [currH, currM] = nowParts.split(':').map(Number);
  const currentTotalMinutes = currH * 60 + currM;

  // 1. Gather all target users
  const userMap = new Map<string, { id: string; name?: string | null; username?: string | null }>();

  if (specificUserId) {
    userMap.set(specificUserId, { id: specificUserId, username: 'user' });
  } else {
    await tryPrisma(
      async () => {
        const dbUsers = await prisma.user.findMany({
          where: {
            id: { notIn: BANNED_IDS },
            username: { notIn: BANNED_PATTERNS },
          },
          select: { id: true, name: true, username: true, email: true },
        });
        for (const u of dbUsers) {
          if (!isDummyUser(u)) {
            userMap.set(u.id, { id: u.id, name: u.name, username: u.username });
          }
        }
      },
      async () => {}
    );

    const storedUsers = persistentStore.getAllUsers();
    for (const u of storedUsers) {
      if (!isDummyUser(u) && !userMap.has(u.id)) {
        userMap.set(u.id, { id: u.id, name: u.name, username: u.username });
      }
    }
  }

  const users = Array.from(userMap.values());
  let remindersSent = 0;
  let skippedAlreadySent = 0;

  for (const user of users) {
    try {
      // 2. Check user settings — default is ON unless explicitly false
      const userSettings = await usersRepository.getSettings(user.id).catch(() => null);
      const notifPrefs = (userSettings?.notificationPrefs || {}) as Record<string, unknown>;
      if (notifPrefs.taskDueReminder === false) {
        continue;
      }

      // 3. Fetch user's occurrences for today in Asia/Kolkata
      const daily = await tasksService.getDailyOccurrences(user.id, targetDate, 'Asia/Kolkata');
      const existingNotifs = await notificationsRepository.findUserNotifications(user.id, false, 50);

      for (const occ of daily.occurrences) {
        // Skip already completed tasks
        if (occ.completed) continue;

        const dueStr = occ.effectiveDueTime || occ.task?.dueTime;
        if (!dueStr) continue;

        const [dh, dm] = dueStr.split(':').map(Number);
        if (isNaN(dh) || isNaN(dm)) continue;
        const dueTotalMinutes = dh * 60 + dm;

        // Calculate time difference in minutes
        const diffMinutes =
          forceDiffMinutes !== undefined ? forceDiffMinutes : dueTotalMinutes - currentTotalMinutes;

        // Check if within the 1-hour reminder window (between 50 and 65 minutes before due time)
        const isOneHourBefore = diffMinutes >= 50 && diffMinutes <= 65;

        if (!isOneHourBefore && forceDiffMinutes === undefined) {
          continue;
        }

        // Deduplication: check if already notified today for this occurrence
        const alreadyNotified = existingNotifs.some((n) => {
          const data = n.data as Record<string, unknown> | null;
          return (
            data?.scheduledNotification === 'task_due_reminder' &&
            data?.occurrenceId === occ.id &&
            data?.date === targetDate
          );
        });

        if (alreadyNotified) {
          skippedAlreadySent++;
          continue;
        }

        const taskTitle = occ.task?.title || 'Habit';
        const title = `⏰ 1 Hour Left: ${taskTitle}`;
        const body = `"${taskTitle}" is due at ${dueStr}. Complete it on-time for +15 XP!`;

        await notificationsRepository.createNotification({
          userId: user.id,
          type: 'deadline_urgent',
          title,
          body,
          data: {
            scheduledNotification: 'task_due_reminder',
            occurrenceId: occ.id,
            taskId: occ.taskId,
            dueTime: dueStr,
            date: targetDate,
          },
        });

        remindersSent++;

        try {
          const io = getIO();
          io.emit(`notification:${user.id}`, {
            title,
            body,
            type: 'deadline_urgent',
            dueTime: dueStr,
            occurrenceId: occ.id,
            date: targetDate,
          });
        } catch {
          // Socket.IO may not be bound in tests
        }
      }
    } catch (err) {
      logger.warn({ err, userId: user.id }, 'Failed to evaluate 1-hour task reminder for user');
    }
  }

  const result: TaskDueReminderResult = {
    targetDate,
    totalUsersEvaluated: users.length,
    remindersSent,
    skippedAlreadySent,
  };

  return result;
}

/**
 * Registers recurring check every 5 minutes to evaluate tasks approaching their 1-hour deadline.
 */
export function startTaskDueReminderScheduler(): void {
  // Cron: '*/5 * * * *' = Every 5 minutes
  cron.schedule(
    '*/5 * * * *',
    async () => {
      try {
        await runTaskDueReminder();
      } catch (err) {
        logger.error({ err }, 'Error executing 1-hour task reminder cron');
      }
    },
    {
      timezone: 'Asia/Kolkata',
    }
  );

  logger.info('⏰ Registered 1-hour task due reminder scheduler (*/5 * * * * in Asia/Kolkata)');
}
