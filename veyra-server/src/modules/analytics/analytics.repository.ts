/** Analytics data access layer with Prisma and in-memory development generator. */
import { prisma, tryPrisma } from '../../db/prisma.js';
import type {
  DailyTrendPoint,
  WeekdayStat,
  CategoryStat,
  HeatmapDay,
  AnalyticsSummaryDTO,
} from './analytics.types.js';

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export class AnalyticsRepository {
  async getAnalytics(
    userId: string,
    period: '7d' | '30d' | '90d' = '30d'
  ): Promise<AnalyticsSummaryDTO> {
    const numDays = period === '7d' ? 7 : period === '90d' ? 90 : 30;

    return tryPrisma(
      async () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - numDays);

        const occurrences = await prisma.taskOccurrence.findMany({
          where: {
            userId,
            date: { gte: startDate },
          },
          include: { task: true },
          orderBy: { date: 'asc' },
        });

        const streaks = await prisma.streak.findUnique({
          where: { userId_type: { userId, type: 'daily' } },
        });

        return this.aggregateOccurrences(occurrences, numDays, period, streaks?.current ?? 0, streaks?.longest ?? 0);
      },
      () => {
        return this.generateDevAnalytics(userId, numDays, period);
      }
    );
  }

  async getHeatmap(userId: string, days = 60): Promise<HeatmapDay[]> {
    return tryPrisma(
      async () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const occurrences = await prisma.taskOccurrence.findMany({
          where: {
            userId,
            date: { gte: startDate },
          },
        });

        const dayMap = new Map<string, { completed: number; total: number }>();
        for (const o of occurrences) {
          const dStr = o.date.toISOString().split('T')[0];
          const curr = dayMap.get(dStr) || { completed: 0, total: 0 };
          curr.total += 1;
          if (o.completed) curr.completed += 1;
          dayMap.set(dStr, curr);
        }

        const result: HeatmapDay[] = [];
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dStr = d.toISOString().split('T')[0];
          const stat = dayMap.get(dStr) || { completed: 0, total: 0 };
          const rate = stat.total > 0 ? stat.completed / stat.total : 0;
          let level: 0 | 1 | 2 | 3 | 4 = 0;
          if (rate > 0.75) level = 4;
          else if (rate > 0.5) level = 3;
          else if (rate > 0.25) level = 2;
          else if (rate > 0) level = 1;

          result.push({ date: dStr, count: stat.completed, level });
        }
        return result;
      },
      () => {
        const result: HeatmapDay[] = [];
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dStr = d.toISOString().split('T')[0];
          result.push({ date: dStr, count: 0, level: 0 });
        }
        return result;
      }
    );
  }

  private aggregateOccurrences(
    occurrences: Array<{ date: Date; completed: boolean; task: { title: string; category?: string | null } }>,
    numDays: number,
    period: '7d' | '30d' | '90d',
    currentStreak: number,
    bestStreak: number
  ): AnalyticsSummaryDTO {
    const dayMap = new Map<string, { completed: number; total: number }>();
    const weekdayMap = new Map<number, { completed: number; total: number }>();
    for (let i = 0; i < 7; i++) weekdayMap.set(i, { completed: 0, total: 0 });

    let totalCompleted = 0;
    let totalScheduled = 0;

    for (const o of occurrences) {
      const dStr = o.date.toISOString().split('T')[0];
      const dayIdx = o.date.getUTCDay();

      const dStat = dayMap.get(dStr) || { completed: 0, total: 0 };
      dStat.total += 1;
      totalScheduled += 1;

      const wStat = weekdayMap.get(dayIdx)!;
      wStat.total += 1;

      if (o.completed) {
        dStat.completed += 1;
        wStat.completed += 1;
        totalCompleted += 1;
      }
      dayMap.set(dStr, dStat);
    }

    const trends: DailyTrendPoint[] = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dStat = dayMap.get(dStr) || { completed: 0, total: 0 };
      const rate = dStat.total > 0 ? Math.round((dStat.completed / dStat.total) * 100) : 0;
      trends.push({
        date: dStr,
        dayOfWeek: WEEKDAY_NAMES[d.getUTCDay()],
        completed: dStat.completed,
        total: dStat.total,
        completionRate: rate,
      });
    }

    const weekdayBreakdown: WeekdayStat[] = [];
    let bestDayIdx = 1;
    let maxRate = -1;

    for (let i = 0; i < 7; i++) {
      const wStat = weekdayMap.get(i)!;
      const rate = wStat.total > 0 ? Math.round((wStat.completed / wStat.total) * 100) : 0;
      if (rate > maxRate) {
        maxRate = rate;
        bestDayIdx = i;
      }
      weekdayBreakdown.push({
        day: WEEKDAY_NAMES[i],
        dayIndex: i,
        completionRate: rate,
        totalOccurrences: wStat.total,
      });
    }

    const averageRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

    return {
      period,
      averageCompletionRate: averageRate,
      totalTasksCompleted: totalCompleted,
      totalTasksScheduled: totalScheduled,
      currentStreak: currentStreak || 0,
      bestStreak: bestStreak || 0,
      topProductiveDay: totalCompleted > 0 ? WEEKDAY_NAMES[bestDayIdx] : 'None',
      trends,
      weekdayBreakdown,
      categoryDistribution: [],
    };
  }

  private generateDevAnalytics(
    _userId: string,
    numDays: number,
    period: '7d' | '30d' | '90d'
  ): AnalyticsSummaryDTO {
    const trends: DailyTrendPoint[] = [];

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayIdx = d.getDay();

      trends.push({
        date: dStr,
        dayOfWeek: WEEKDAY_NAMES[dayIdx],
        completed: 0,
        total: 0,
        completionRate: 0,
      });
    }

    const weekdayBreakdown: WeekdayStat[] = [
      { day: 'Mon', dayIndex: 1, completionRate: 0, totalOccurrences: 0 },
      { day: 'Tue', dayIndex: 2, completionRate: 0, totalOccurrences: 0 },
      { day: 'Wed', dayIndex: 3, completionRate: 0, totalOccurrences: 0 },
      { day: 'Thu', dayIndex: 4, completionRate: 0, totalOccurrences: 0 },
      { day: 'Fri', dayIndex: 5, completionRate: 0, totalOccurrences: 0 },
      { day: 'Sat', dayIndex: 6, completionRate: 0, totalOccurrences: 0 },
      { day: 'Sun', dayIndex: 0, completionRate: 0, totalOccurrences: 0 },
    ];

    return {
      period,
      averageCompletionRate: 0,
      totalTasksCompleted: 0,
      totalTasksScheduled: 0,
      currentStreak: 0,
      bestStreak: 0,
      topProductiveDay: 'None',
      trends,
      weekdayBreakdown,
      categoryDistribution: [],
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();
