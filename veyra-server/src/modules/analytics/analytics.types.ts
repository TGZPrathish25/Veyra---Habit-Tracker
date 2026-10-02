/** Analytics type definitions for trend lines, bar charts, heatmaps, and category breakdowns. */

export interface DailyTrendPoint {
  date: string;
  dayOfWeek: string;
  completed: number;
  total: number;
  completionRate: number;
}

export interface WeekdayStat {
  day: string;
  dayIndex: number; // 0=Sun, 1=Mon, ..., 6=Sat
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
  level: 0 | 1 | 2 | 3 | 4; // 0=0%, 1=1-25%, 2=26-50%, 3=51-75%, 4=76-100%
}

export interface AnalyticsSummaryDTO {
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
