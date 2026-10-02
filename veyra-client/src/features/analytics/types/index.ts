/** Analytics feature client types. */

export interface DailyTrendPoint {
  date: string;
  dayOfWeek: string;
  completed: number;
  total: number;
  completionRate: number;
}

export interface WeekdayStat {
  day: string;
  dayIndex: number;
  completionRate: number;
  totalOccurrences: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface AnalyticsSummary {
  period: '7d' | '30d' | '90d';
  averageCompletionRate: number;
  totalTasksCompleted: number;
  totalTasksScheduled: number;
  currentStreak: number;
  bestStreak: number;
  topProductiveDay: string;
  trends: DailyTrendPoint[];
  weekdayBreakdown: WeekdayStat[];
  categoryDistribution: CategoryStat[];
}
