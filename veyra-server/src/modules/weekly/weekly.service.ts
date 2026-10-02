/** Weekly plan business logic with Indian Standard Time support. */
import { weeklyRepository } from './weekly.repository.js';
import type { WeeklyPlanDTO, CreateWeeklyPlanInput, UpdateWeeklyPlanInput } from './weekly.types.js';
import { NotFoundError, ForbiddenError } from '../../lib/errors.js';
import { DEFAULT_TIMEZONE, getWeekMondayDate } from '../../lib/time.js';

export { getWeekMondayDate };

export class WeeklyService {
  async getCurrentPlan(userId: string, weekStartStr?: string, timezone = DEFAULT_TIMEZONE): Promise<WeeklyPlanDTO> {
    const monday = getWeekMondayDate(weekStartStr, timezone);
    let plan = await weeklyRepository.findByUserAndWeek(userId, monday);
    if (!plan) {
      plan = await weeklyRepository.upsertWeeklyPlan(userId, monday, {
        goals: [],
      });
    }
    return plan;
  }

  async savePlan(userId: string, data: CreateWeeklyPlanInput, timezone = DEFAULT_TIMEZONE): Promise<WeeklyPlanDTO> {
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

  async rolloverWeek(userId: string, timezone = DEFAULT_TIMEZONE): Promise<{ previousLocked: boolean; currentPlan: WeeklyPlanDTO }> {
    const currentMonday = getWeekMondayDate(undefined, timezone);

    // Calculate previous Monday
    const prevMonday = new Date(currentMonday);
    prevMonday.setUTCDate(prevMonday.getUTCDate() - 7);

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
