/** Weekly plan business logic. */
import { weeklyRepository } from './weekly.repository.js';
import type { WeeklyPlanDTO, CreateWeeklyPlanInput, UpdateWeeklyPlanInput } from './weekly.types.js';
import { NotFoundError, ForbiddenError } from '../../lib/errors.js';

export function getWeekMondayDate(dateStr?: string, _timezone = 'UTC'): Date {
  const d = dateStr ? new Date(dateStr) : new Date();
  const day = d.getDay(); // 0 = Sun, 1 = Mon... 6 = Sat
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  const [y, m, dayOfMonth] = monday.toISOString().split('T')[0].split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, dayOfMonth));
}

export class WeeklyService {
  async getCurrentPlan(userId: string, weekStartStr?: string, timezone = 'UTC'): Promise<WeeklyPlanDTO> {
    const monday = getWeekMondayDate(weekStartStr, timezone);
    let plan = await weeklyRepository.findByUserAndWeek(userId, monday);
    if (!plan) {
      plan = await weeklyRepository.upsertWeeklyPlan(userId, monday, {
        goals: [],
      });
    }
    return plan;
  }

  async savePlan(userId: string, data: CreateWeeklyPlanInput, timezone = 'UTC'): Promise<WeeklyPlanDTO> {
    const monday = getWeekMondayDate(data.weekStart, timezone);
    const existing = await weeklyRepository.findByUserAndWeek(userId, monday);
    if (existing?.isLocked) {
      throw new ForbiddenError('This weekly plan is locked and cannot be edited');
    }
    return weeklyRepository.upsertWeeklyPlan(userId, monday, data);
  }

  async updatePlan(userId: string, planId: string, data: UpdateWeeklyPlanInput): Promise<WeeklyPlanDTO> {
    const plan = await weeklyRepository.findById(planId);
    if (!plan) {
      throw new NotFoundError('Weekly plan not found');
    }
    if (plan.userId !== userId) {
      throw new ForbiddenError('You do not have permission to modify this plan');
    }
    if (plan.isLocked && data.isLocked !== false) {
      throw new ForbiddenError('This weekly plan is locked and cannot be edited');
    }
    return weeklyRepository.updateWeeklyPlan(planId, data);
  }

  async rolloverWeek(userId: string, timezone = 'UTC'): Promise<{ previousLocked: boolean; currentPlan: WeeklyPlanDTO }> {
    const now = new Date();
    const currentMonday = getWeekMondayDate(undefined, timezone);

    // Calculate previous Monday
    const prevMonday = new Date(currentMonday);
    prevMonday.setDate(prevMonday.getDate() - 7);

    const prevPlan = await weeklyRepository.findByUserAndWeek(userId, prevMonday);
    let previousLocked = false;
    if (prevPlan && !prevPlan.isLocked) {
      await weeklyRepository.updateWeeklyPlan(prevPlan.id, { isLocked: true });
      previousLocked = true;
    }

    const currentPlan = await this.getCurrentPlan(userId, undefined, timezone);
    return {
      previousLocked,
      currentPlan,
    };
  }
}

export const weeklyService = new WeeklyService();
