/** Monthly goals & plan business logic with Indian Standard Time support. */
import { monthlyRepository } from './monthly.repository.js';
import type {
  MonthlyPlanDTO,
  MonthlySnapshotDTO,
  CreateMonthlyPlanInput,
  UpdateMonthlyPlanInput,
} from './monthly.types.js';
import { NotFoundError, ForbiddenError } from '../../lib/errors.js';
import { DEFAULT_TIMEZONE, getCurrentYearAndMonth } from '../../lib/time.js';

export { getCurrentYearAndMonth };

export class MonthlyService {
  async getCurrentPlan(userId: string, targetYear?: number, targetMonth?: number, timezone = DEFAULT_TIMEZONE): Promise<MonthlyPlanDTO> {
    const { year: currentYear, month: currentMonth } = getCurrentYearAndMonth(timezone);
    const year = targetYear || currentYear;
    const month = targetMonth || currentMonth;

    let plan = await monthlyRepository.findByUserAndMonth(userId, year, month);
    if (!plan) {
      plan = await monthlyRepository.upsertMonthlyPlan(userId, year, month, {
        goals: [],
      });
    }
    return plan;
  }

  async savePlan(userId: string, data: CreateMonthlyPlanInput, timezone = DEFAULT_TIMEZONE): Promise<MonthlyPlanDTO> {
    const { year: currentYear, month: currentMonth } = getCurrentYearAndMonth(timezone);
    const year = data.year || currentYear;
    const month = data.month || currentMonth;

    const existing = await monthlyRepository.findByUserAndMonth(userId, year, month);
    if (existing?.isLocked) {
      throw new ForbiddenError('This monthly plan is locked and cannot be edited');
    }

    return monthlyRepository.upsertMonthlyPlan(userId, year, month, data);
  }

  async updatePlan(userId: string, planId: string, data: UpdateMonthlyPlanInput): Promise<MonthlyPlanDTO> {
    const plan = await monthlyRepository.findById(planId);
    if (!plan) {
      throw new NotFoundError('Monthly plan not found');
    }
    if (plan.userId !== userId) {
      throw new ForbiddenError('You do not have permission to modify this plan');
    }
    if (plan.isLocked && data.isLocked !== false) {
      throw new ForbiddenError('This monthly plan is locked and cannot be edited');
    }
    return monthlyRepository.updateMonthlyPlan(planId, data);
  }

  async lockMonth(
    userId: string,
    year: number,
    month: number,
    stats?: {
      tasksCompleted?: number;
      totalTasks?: number;
      xpEarned?: number;
      streakDays?: number;
    }
  ): Promise<{ plan: MonthlyPlanDTO; snapshot: MonthlySnapshotDTO }> {
    return this.lockAndSnapshot(userId, year, month, stats);
  }

  async lockAndSnapshot(
    userId: string,
    year: number,
    month: number,
    stats?: {
      tasksCompleted?: number;
      totalTasks?: number;
      xpEarned?: number;
      streakDays?: number;
    }
  ): Promise<{ plan: MonthlyPlanDTO; snapshot: MonthlySnapshotDTO }> {
    const plan = await monthlyRepository.findByUserAndMonth(userId, year, month);
    if (!plan) {
      throw new NotFoundError(`Monthly plan for ${year}-${month} not found`);
    }

    const updatedPlan = await monthlyRepository.updateMonthlyPlan(plan.id, { isLocked: true });

    const totalTasks = stats?.totalTasks ?? (plan.goals.length * 4 || 10);
    const tasksCompleted = stats?.tasksCompleted ?? plan.goals.filter((g) => g.completed).length;
    const completionRate = totalTasks > 0 ? Number(((tasksCompleted / totalTasks) * 100).toFixed(1)) : 0;
    const xpEarned = stats?.xpEarned ?? tasksCompleted * 50;
    const streakDays = stats?.streakDays ?? 0;

    const snapshot = await monthlyRepository.createSnapshot({
      userId,
      year,
      month,
      tasksCompleted,
      totalTasks,
      completionRate,
      xpEarned,
      streakDays,
    });

    return {
      plan: updatedPlan,
      snapshot,
    };
  }
}

export const monthlyService = new MonthlyService();
