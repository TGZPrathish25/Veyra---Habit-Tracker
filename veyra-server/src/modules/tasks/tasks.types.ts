/** Daily recurring task types and occurrence models. */

export interface TaskDTO {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  emoji: string | null;
  color: string | null;
  isRecurring: boolean;
  daysOfWeek: number[]; // 0-6 (0=Sun, 1=Mon... 6=Sat)
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  emoji?: string | null;
  color?: string | null;
  isRecurring?: boolean;
  daysOfWeek?: number[];
  sortOrder?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  emoji?: string | null;
  color?: string | null;
  isRecurring?: boolean;
  daysOfWeek?: number[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface TaskOccurrenceDTO {
  id: string;
  taskId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt: Date | null;
  xpAwarded: number;
  task?: TaskDTO;
}

export interface DailyOccurrencesResponse {
  date: string;
  occurrences: TaskOccurrenceDTO[];
  summary: {
    totalTasks: number;
    completedTasks: number;
    completionPercentage: number;
    isPastDate: boolean;
    isToday: boolean;
  };
}
