/**
 * Daily 9:00 PM IST Scheduled Completion Reminder Job.
 * Evaluates habit completion for every user in Asia/Kolkata timezone strictly at 9:00 PM.
 * Sends short, motivating notifications stating 100% completion or exact remaining %.
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

export interface ReminderJobResult {
  targetDate: string;
  totalUsersEvaluated: number;
  notificationsSent: number;
  skippedAlreadySent: number;
}

/**
 * Core runner that evaluates habit completion and sends 9:00 PM IST notifications.
 * Can be called automatically by cron or manually for preview/tests.
 */
export async function runDailyCompletionReminder(forceDate?: string, specificUserId?: string): Promise<ReminderJobResult> {
  const targetDate =
    forceDate ||
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

  logger.info({ targetDate, specificUserId }, '🔔 Starting 9:00 PM IST daily habit completion reminder evaluation...');

  // 1. Gather all registered, non-dummy users
  const userMap = new Map<string, { id: string; name?: string | null; username?: string | null }>();

  if (specificUserId) {
    userMap.set(specificUserId, { id: specificUserId, username: 'user' });
  } else {
    // A. From Prisma
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
      async () => {
        // Prisma fallback
      }
    );

    // B. From persistentStore (includes any Firebase users synced locally)
    const storedUsers = persistentStore.getAllUsers();
    for (const u of storedUsers) {
      if (!isDummyUser(u) && !userMap.has(u.id)) {
        userMap.set(u.id, { id: u.id, name: u.name, username: u.username });
      }
    }
  }

  const users = Array.from(userMap.values());
  let notificationsSent = 0;
  let skippedAlreadySent = 0;

  for (const user of users) {
    try {
      // 2. Check user notification settings — default is ON unless explicitly false
      const userSettings = await usersRepository.getSettings(user.id).catch(() => null);
      const notifPrefs = (userSettings?.notificationPrefs || {}) as Record<string, unknown>;
      if (notifPrefs.dailyEveningReminder === false) {
        continue;
      }

      // 3. Check if user already received today's 9:00 PM reminder
      const existing = await notificationsRepository.findUserNotifications(user.id, false, 20);
      const alreadySent = existing.some((n) => {
        const data = n.data as Record<string, unknown> | null;
        return (
          (data?.scheduledNotification === 'evening_9pm_ist' ||
           data?.scheduledNotification === 'evening_910pm_ist' ||
           data?.scheduledNotification === 'evening_930pm_ist') &&
          data?.date === targetDate
        );
      });

      if (alreadySent) {
        skippedAlreadySent++;
        continue;
      }

      // 4. Fetch user's occurrences & habit summary for today in Asia/Kolkata timezone
      const daily = await tasksService.getDailyOccurrences(user.id, targetDate, 'Asia/Kolkata');
      const { totalTasks, completedTasks, completionPercentage } = daily.summary;

      // 5. Craft short and perfect notification copy
      let title: string;
      let body: string;

      if (totalTasks === 0) {
        title = '🌙 Evening Habit Check-in';
        body = 'No habits scheduled for today. Ready to plan your goals for tomorrow?';
      } else if (completedTasks === totalTasks) {
        title = '🌟 100% Completed — Perfect Day!';
        body = `You crushed all ${totalTasks} habits today. Great job keeping the streak alive!`;
      } else {
        const uncompletedPercentage = 100 - completionPercentage;
        if (completedTasks > 0) {
          title = `⚡ ${uncompletedPercentage}% Not Completed Today`;
          body = `${completedTasks}/${totalTasks} habits done (${uncompletedPercentage}% left). Finish strong before midnight!`;
        } else {
          title = `⏳ 100% Not Completed Today`;
          body = `0/${totalTasks} habits logged today. Take a quick moment to keep your streak going!`;
        }
      }

      // 6. Store notification
      await notificationsRepository.createNotification({
        userId: user.id,
        type: 'streak',
        title,
        body,
        data: {
          scheduledNotification: 'evening_9pm_ist',
          date: targetDate,
          totalTasks,
          completedTasks,
          completionPercentage,
          uncompletedPercentage: totalTasks > 0 ? 100 - completionPercentage : 0,
        },
      });

      notificationsSent++;

      // 7. Broadcast via Socket.IO if connected
      try {
        const io = getIO();
        io.emit(`notification:${user.id}`, {
          title,
          body,
          type: 'streak',
          date: targetDate,
        });
      } catch {
        // Socket.IO may not be initialized in headless test runs
      }
    } catch (err) {
      logger.warn({ err, userId: user.id }, 'Failed to evaluate 9:00 PM completion reminder for user');
    }
  }

  const result: ReminderJobResult = {
    targetDate,
    totalUsersEvaluated: users.length,
    notificationsSent,
    skippedAlreadySent,
  };

  logger.info(result, '✅ 9:00 PM IST daily completion reminder evaluation finished');
  return result;
}

/**
 * Registers the node-cron scheduler strictly at 9:00 PM (21:00) IST daily.
 */
export function startDailyCompletionScheduler(): void {
  // Cron: '0 21 * * *' = Strictly at 21:00 (9:00 PM) every day
  cron.schedule(
    '0 21 * * *',
    async () => {
      logger.info('⏰ Cron triggered: 9:00 PM India timezone daily habit completion reminder');
      try {
        await runDailyCompletionReminder();
      } catch (err) {
        logger.error({ err }, 'Error executing 9:00 PM daily completion reminder cron');
      }
    },
    {
      timezone: 'Asia/Kolkata',
    }
  );

  logger.info('⏰ Registered 9:00 PM India timezone (Asia/Kolkata) daily completion reminder cron (0 21 * * *)');
}
