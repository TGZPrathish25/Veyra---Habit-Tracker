/** Streaks business logic and calculation engine. */
import { streaksRepository } from './streaks.repository.js';
import type { StreakDTO, UserStreaksResponse } from './streaks.types.js';
import { getIndianTodayDateString } from '../../lib/time.js';

function getYesterdayDateStr(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().split('T')[0];
}

export class StreaksService {
  async getUserStreaks(userId: string): Promise<UserStreaksResponse> {
    const [daily, weekly, monthly] = await Promise.all([
      streaksRepository.getStreak(userId, 'daily'),
      streaksRepository.getStreak(userId, 'weekly'),
      streaksRepository.getStreak(userId, 'monthly'),
    ]);

    return {
      daily,
      weekly,
      monthly,
    };
  }

  async recordDailyActivity(
    userId: string,
    activityDateStr = getIndianTodayDateString()
  ): Promise<{ streak: StreakDTO; increased: boolean; reset: boolean }> {
    const streak = await streaksRepository.getStreak(userId, 'daily');
    const yesterdayStr = getYesterdayDateStr(activityDateStr);

    let nextCurrent = streak.current;
    let increased = false;
    let reset = false;

    if (streak.lastActiveDate === activityDateStr) {
      // Already checked in today
      return { streak, increased: false, reset: false };
    }

    if (streak.lastActiveDate === yesterdayStr) {
      // Consecutive day!
      nextCurrent += 1;
      increased = true;
    } else {
      // Missed at least one day or first activity
      nextCurrent = 1;
      reset = streak.current > 0;
      increased = true;
    }

    const nextLongest = Math.max(streak.longest, nextCurrent);
    const updated = await streaksRepository.saveStreak({
      ...streak,
      current: nextCurrent,
      longest: nextLongest,
      lastActiveDate: activityDateStr,
    });

    return {
      streak: updated,
      increased,
      reset,
    };
  }
}

export const streaksService = new StreaksService();
