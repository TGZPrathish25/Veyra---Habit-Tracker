/** Singleton PrismaClient instance with shared connectivity detection and dev fallback. */
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

let dbAvailable: boolean | null =
  process.env.NODE_ENV === 'test' && !process.env.TEST_WITH_POSTGRES ? false : null;

export async function tryPrisma<T>(op: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  if (dbAvailable === false) {
    return fallback();
  }
  try {
    const result = await op();
    dbAvailable = true;
    return result;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';
    if (
      msg.includes("Can't reach database server") ||
      msg.includes('P1001') ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('connect ECONNREFUSED')
    ) {
      if (dbAvailable === null) {
        // Log once
        console.warn('ℹ️  PostgreSQL not reachable at localhost:5432 — using in-memory store for development');
      }
      dbAvailable = false;
      return fallback();
    }
    throw error;
  }
}

/**
 * Automatically verifies and adds missing columns/indexes on server startup.
 * Self-heals production databases (e.g. Render PostgreSQL) without requiring manual SQL commands.
 */
export async function ensureDatabaseSchema(): Promise<void> {
  if (dbAvailable === false) return;
  try {
    const statements = [
      'ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "due_time" TEXT',
      'ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "day_due_times" JSONB',
      'CREATE INDEX IF NOT EXISTS "tasks_user_id_is_active_idx" ON "tasks"("user_id", "is_active")',
      'CREATE INDEX IF NOT EXISTS "task_occurrences_user_id_date_idx" ON "task_occurrences"("user_id", "date")',
      'CREATE INDEX IF NOT EXISTS "notifications_user_id_read_idx" ON "notifications"("user_id", "read")',
    ];

    for (const sql of statements) {
      await prisma.$executeRawUnsafe(sql);
    }

    dbAvailable = true;
    console.info('✅ PostgreSQL schema verified & columns (due_time, day_due_times) synchronized');
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';
    if (
      msg.includes("Can't reach database server") ||
      msg.includes('P1001') ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('connect ECONNREFUSED')
    ) {
      dbAvailable = false;
      return;
    }
    console.warn('⚠️  Database schema sync skipped or non-fatal:', msg);
  }
}

