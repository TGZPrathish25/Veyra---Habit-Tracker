/** History and snapshot module type definitions. */

export interface MonthNodeDTO {
  year: number;
  month: number;
  monthName: string;
  isLocked: boolean;
  tasksCompleted: number;
  totalTasks: number;
  completionRate: number;
  xpEarned: number;
}

export interface YearTreeDTO {
  year: number;
  totalCompleted: number;
  months: MonthNodeDTO[];
}

export interface DayHistoryDTO {
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

export interface MonthSnapshotDTO {
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
  days: DayHistoryDTO[];
}
