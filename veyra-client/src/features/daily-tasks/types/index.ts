/** Types for daily tasks and occurrences feature. */

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  emoji: string | null;
  color: string | null;
  isRecurring: boolean;
  daysOfWeek: number[]; // 0-6 Sun-Sat
  dueTime?: string | null;
  dayDueTimes?: Record<string, string> | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskOccurrence {
  id: string;
  taskId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt: string | null;
  xpAwarded: number;
  effectiveDueTime?: string | null;
  isExpired?: boolean;
  task?: Task;
}

export interface DailyOccurrencesResponse {
  date: string;
  occurrences: TaskOccurrence[];
  summary: {
    totalTasks: number;
    completedTasks: number;
    missedTasks?: number;
    completionPercentage: number;
    isPastDate: boolean;
    isToday: boolean;
  };
}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  emoji?: string | null;
  color?: string | null;
  isRecurring?: boolean;
  daysOfWeek?: number[];
  dueTime?: string | null;
  dayDueTimes?: Record<string, string> | null;
  sortOrder?: number;
}

