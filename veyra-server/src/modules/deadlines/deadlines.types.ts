/** Deadline monitoring and urgency types. */

export type UrgencyLevel = 'normal' | 'approaching' | 'urgent' | 'overdue';

export interface TaskDeadlineStatus {
  taskId: string;
  occurrenceId?: string;
  title: string;
  emoji?: string | null;
  dueAt: Date;
  minutesRemaining: number;
  urgency: UrgencyLevel;
  completed: boolean;
}

export interface DeadlineStatusResponse {
  counts: {
    urgent: number;
    approaching: number;
    normal: number;
    overdue: number;
  };
  deadlines: TaskDeadlineStatus[];
}
