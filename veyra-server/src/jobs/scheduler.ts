/** Registers cron jobs; guarded by Postgres advisory lock so only one instance runs them. */
import { logger } from '../config/logger.js';

export function startScheduler(): void {
  logger.info('📅 Scheduler started (no jobs registered yet — scaffold only)');
  // TODO: Register cron jobs with node-cron
  // Each job should acquire an advisory lock before running
}
