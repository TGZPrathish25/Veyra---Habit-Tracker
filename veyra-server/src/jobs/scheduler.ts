/** Registers cron jobs and keep-alive ping to prevent Render host suspension. */
import cron from 'node-cron';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { startDailyCompletionScheduler } from './dailyCompletionReminder.job.js';

export function startScheduler(): void {
  logger.info('📅 Scheduler started');

  // Daily 9:30 PM IST (Asia/Kolkata) completion reminder
  startDailyCompletionScheduler();

  // Keep-alive job: pings the public endpoint every 10 minutes in production
  if (env.NODE_ENV === 'production') {
    const keepAliveUrl = process.env.RENDER_EXTERNAL_URL || 'https://veyra-habit-tracker.onrender.com';
    const pingTarget = `${keepAliveUrl.replace(/\/+$/, '')}/ping`;

    cron.schedule('*/10 * * * *', async () => {
      try {
        const res = await fetch(pingTarget);
        logger.debug(`Keep-alive ping sent to ${pingTarget} (HTTP ${res.status})`);
      } catch (err) {
        logger.warn({ err }, 'Keep-alive self-ping encountered network glitch');
      }
    });

    logger.info(`⏰ Registered keep-alive job every 10 minutes for ${pingTarget}`);
  }
}

