/** Singleton PrismaClient instance with shared connectivity detection and dev fallback. */
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

let dbAvailable: boolean | null = null;

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
