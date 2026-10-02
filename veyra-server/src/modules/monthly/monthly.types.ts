/** Monthly goals and plan types and models. */

export interface MonthlyGoalItem {
  id?: string;
  title: string;
  category?: string;
  targetCount: number;
  completedCount: number;
  completed?: boolean;
}

export interface MonthlyPlanDTO {
  id: string;
  userId: string;
  year: number;
  month: number; // 1-12
  goals: MonthlyGoalItem[];
  reflection: string | null;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlySnapshotDTO {
  id: string;
  userId: string;
  year: number;
  month: number;
  tasksCompleted: number;
  totalTasks: number;
  completionRate: number;
  xpEarned: number;
  streakDays: number;
  createdAt: Date;
}

export interface CreateMonthlyPlanInput {
  year?: number;
  month?: number;
  goals?: MonthlyGoalItem[];
  reflection?: string | null;
}

export interface UpdateMonthlyPlanInput {
  goals?: MonthlyGoalItem[];
  reflection?: string | null;
  isLocked?: boolean;
}
