/** Application constants: XP rules, level thresholds, deadline thresholds. */

export const XP_RULES = {
  TASK_COMPLETION: 10,
  DAILY_BONUS: 25,
  WEEKLY_PLAN_COMPLETE: 50,
  MONTHLY_GOAL_COMPLETE: 100,
  STREAK_BONUS_MULTIPLIER: 0.1,
} as const;

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000,
] as const;

export const DEADLINE_THRESHOLDS = {
  LEVEL_1: 7,  // days
  LEVEL_2: 3,
  LEVEL_3: 1,
  LEVEL_4: 0,  // overdue
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
