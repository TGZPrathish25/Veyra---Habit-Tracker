/** History and permanent monthly snapshot repository with Prisma and in-memory development fallback. */
import { prisma, tryPrisma } from '../../db/prisma.js';
import { getCurrentYearAndMonth } from '../../lib/time.js';
import type {
  YearTreeDTO,
  MonthNodeDTO,
  MonthSnapshotDTO,
  DayHistoryDTO,
} from './history.types.js';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export class HistoryRepository {
  async getTree(userId: string): Promise<YearTreeDTO[]> {
    return tryPrisma(
      async () => {
        const snapshots = await prisma.monthlySnapshot.findMany({
          where: { userId },
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
        });

        // Current month plan in Indian Standard Time
        const { year: curYear, month: curMonth } = getCurrentYearAndMonth();

        const months: MonthNodeDTO[] = [];
        // Add current month if not yet locked in snapshot
        if (!snapshots.some((s) => s.year === curYear && s.month === curMonth)) {
          months.push({
            year: curYear,
            month: curMonth,
            monthName: MONTH_NAMES[curMonth - 1],
            isLocked: false,
            tasksCompleted: 0,
            totalTasks: 0,
            completionRate: 0,
            xpEarned: 0,
          });
        }

        for (const s of snapshots) {
          months.push({
            year: s.year,
            month: s.month,
            monthName: MONTH_NAMES[s.month - 1],
            isLocked: true,
            tasksCompleted: s.tasksCompleted,
            totalTasks: s.totalTasks,
            completionRate: Math.round(s.completionRate),
            xpEarned: s.xpEarned,
          });
        }

        return [
          {
            year: curYear,
            totalCompleted: months.reduce((sum, m) => sum + m.tasksCompleted, 0),
            months,
          },
        ];
      },
      () => {
        const { year: curYear, month: curMonth } = getCurrentYearAndMonth();
        return [
          {
            year: curYear,
            totalCompleted: 0,
            months: [
              {
                year: curYear,
                month: curMonth,
                monthName: MONTH_NAMES[curMonth - 1] || 'Current Month',
                isLocked: false,
                tasksCompleted: 0,
                totalTasks: 0,
                completionRate: 0,
                xpEarned: 0,
              },
            ],
          },
        ];
      }
    );
  }

  async getMonthSnapshot(
    userId: string,
    year: number,
    month: number
  ): Promise<MonthSnapshotDTO | null> {
    return tryPrisma(
      async () => {
        const snap = await prisma.monthlySnapshot.findUnique({
          where: { userId_year_month: { userId, year, month } },
        });

        const plan = await prisma.monthlyPlan.findUnique({
          where: { userId_year_month: { userId, year, month } },
        });

        const isLocked = snap !== null || (plan?.isLocked ?? false);
        const days = this.generateDaysForMonth(year, month);

        return {
          id: snap?.id || `snap-${year}-${month}`,
          userId,
          year,
          month,
          monthName: MONTH_NAMES[month - 1] || 'Month',
          isLocked,
          tasksCompleted: snap?.tasksCompleted ?? 0,
          totalTasks: snap?.totalTasks ?? 0,
          completionRate: snap ? Math.round(snap.completionRate) : 0,
          xpEarned: snap?.xpEarned ?? 0,
          streakDays: snap?.streakDays ?? 0,
          reflection: plan?.reflection || (snap ? 'Month successfully closed.' : null),
          days,
        };
      },
      () => {
        const now = new Date();
        const curYear = now.getUTCFullYear();
        const curMonth = now.getUTCMonth() + 1;
        const isCurrent = year === curYear && month === curMonth;
        const days = this.generateDaysForMonth(year, month);
        return {
          id: `snap-${year}-${month}`,
          userId,
          year,
          month,
          monthName: MONTH_NAMES[month - 1] || 'Month',
          isLocked: !isCurrent,
          tasksCompleted: 0,
          totalTasks: 0,
          completionRate: 0,
          xpEarned: 0,
          streakDays: 0,
          reflection: null,
          days,
        };
      }
    );
  }

  private generateDaysForMonth(year: number, month: number): DayHistoryDTO[] {
    const totalDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const days: DayHistoryDTO[] = [];

    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const dateObj = new Date(Date.UTC(year, month - 1, dayNum));
      const dateStr = dateObj.toISOString().split('T')[0];
      const dayOfWeek = WEEKDAY_NAMES[dateObj.getUTCDay()];

      days.push({
        date: dateStr,
        dayNumber: dayNum,
        dayOfWeek,
        completedCount: 0,
        totalCount: 0,
        status: 'missed',
        tasks: [],
      });
    }

    return days;
  }
}

export const historyRepository = new HistoryRepository();
