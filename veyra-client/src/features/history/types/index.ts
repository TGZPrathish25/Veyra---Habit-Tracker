/** History and monthly snapshots client types. */

export interface MonthNode {
  year: number;
  month: number;
  monthName: string;
  isLocked: boolean;
  tasksCompleted: number;
  totalTasks: number;
  completionRate: number;
  xpEarned: number;
}

export interface YearTree {
  year: number;
  totalCompleted: number;
  months: MonthNode[];
}

export interface DayHistory {
  date: string;
  dayNumber: number;
  dayOfWeek: string;
  completedCount: number;
  totalCount: number;
  status: 'completed' | 'partial' | 'missed';
  tasks: Array<{
    title: string;
    emoji: string | null;
    completed: boolean;
  }>;
}

export interface MonthSnapshot {
  id: string;
  userId: string;
  year: number;
  month: number;
  monthName: string;
  isLocked: boolean;
  tasksCompleted: number;
  totalTasks: number;
  completionRate: number;
  xpEarned: number;
  streakDays: number;
  reflection: string | null;
  days: DayHistory[];
}
