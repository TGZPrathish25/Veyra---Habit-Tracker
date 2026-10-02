/** Weekly planning types and models. */

export interface WeeklyGoalItem {
  id?: string;
  title: string;
  category?: string;
  targetCount: number;
  completedCount: number;
  completed?: boolean;
}

export interface WeeklyPlanDTO {
  id: string;
  userId: string;
  weekStart: string; // YYYY-MM-DD
  goals: WeeklyGoalItem[];
  reflection: string | null;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWeeklyPlanInput {
  weekStart?: string; // defaults to current Monday
  goals?: WeeklyGoalItem[];
  reflection?: string | null;
}

export interface UpdateWeeklyPlanInput {
  goals?: WeeklyGoalItem[];
  reflection?: string | null;
  isLocked?: boolean;
}
