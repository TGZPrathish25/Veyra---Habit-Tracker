import { prisma, tryPrisma } from '../../db/prisma.js';
import type { StreakDTO } from './streaks.types.js';

const memStreaks = new Map<string, StreakDTO>();

function formatDateString(d: Date | null): string | null {
  if (!d) return null;
  return d.toISOString().split('T')[0];
}

export class StreaksRepository {
  async getStreak(userId: string, type: 'daily' | 'weekly' | 'monthly'): Promise<StreakDTO> {
    return tryPrisma(
      async () => {
        let s = await prisma.streak.findUnique({
          where: {
            userId_type: {
              userId,
              type,
            },
          },
        });
        if (!s) {
          s = await prisma.streak.create({
            data: {
              userId,
              type,
              current: 0,
              longest: 0,
              lastActiveDate: null,
            },
          });
        }
        return {
          id: s.id,
          userId: s.userId,
          type: s.type as StreakDTO['type'],
          current: s.current,
          longest: s.longest,
          lastActiveDate: formatDateString(s.lastActiveDate),
        };
      },
      () => {
        const key = `${userId}_${type}`;
        let s = memStreaks.get(key);
        if (!s) {
          s = {
            userId,
            type,
            current: 0,
            longest: 0,
            lastActiveDate: null,
          };
          memStreaks.set(key, s);
        }
        return s;
      }
    );
  }

  async saveStreak(streak: StreakDTO): Promise<StreakDTO> {
    const lastActive = streak.lastActiveDate ? new Date(`${streak.lastActiveDate}T00:00:00Z`) : null;

    return tryPrisma(
      async () => {
        const updated = await prisma.streak.upsert({
          where: {
            userId_type: {
              userId: streak.userId,
              type: streak.type,
            },
          },
          create: {
            userId: streak.userId,
            type: streak.type,
            current: streak.current,
            longest: streak.longest,
            lastActiveDate: lastActive,
          },
          update: {
            current: streak.current,
            longest: streak.longest,
            lastActiveDate: lastActive,
          },
        });
        return {
          id: updated.id,
          userId: updated.userId,
          type: updated.type as StreakDTO['type'],
          current: updated.current,
          longest: updated.longest,
          lastActiveDate: formatDateString(updated.lastActiveDate),
        };
      },
      () => {
        const key = `${streak.userId}_${streak.type}`;
        memStreaks.set(key, streak);
        return streak;
      }
    );
  }
}

export const streaksRepository = new StreaksRepository();
