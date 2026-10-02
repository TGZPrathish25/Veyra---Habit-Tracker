import { prisma, tryPrisma } from '../../db/prisma.js';
import type { WeeklyPlanDTO, CreateWeeklyPlanInput, UpdateWeeklyPlanInput, WeeklyGoalItem } from './weekly.types.js';

const memWeeklyPlans = new Map<string, WeeklyPlanDTO>();

function formatDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

export class WeeklyRepository {
  async findByUserAndWeek(userId: string, weekStart: Date): Promise<WeeklyPlanDTO | null> {
    const dateStr = formatDateString(weekStart);
    return tryPrisma(
      async () => {
        const plan = await prisma.weeklyPlan.findUnique({
          where: {
            userId_weekStart: {
              userId,
              weekStart,
            },
          },
        });
        if (!plan) return null;
        return {
          id: plan.id,
          userId: plan.userId,
          weekStart: formatDateString(plan.weekStart),
          goals: (plan.goals as unknown as WeeklyGoalItem[]) || [],
          reflection: plan.reflection,
          isLocked: plan.isLocked,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        };
      },
      () => {
        const key = `${userId}_${dateStr}`;
        return memWeeklyPlans.get(key) || null;
      }
    );
  }

  async findById(planId: string): Promise<WeeklyPlanDTO | null> {
    return tryPrisma(
      async () => {
        const plan = await prisma.weeklyPlan.findUnique({
          where: { id: planId },
        });
        if (!plan) return null;
        return {
          id: plan.id,
          userId: plan.userId,
          weekStart: formatDateString(plan.weekStart),
          goals: (plan.goals as unknown as WeeklyGoalItem[]) || [],
          reflection: plan.reflection,
          isLocked: plan.isLocked,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        };
      },
      () => {
        for (const p of memWeeklyPlans.values()) {
          if (p.id === planId) return p;
        }
        return null;
      }
    );
  }

  async upsertWeeklyPlan(
    userId: string,
    weekStart: Date,
    data: CreateWeeklyPlanInput
  ): Promise<WeeklyPlanDTO> {
    const dateStr = formatDateString(weekStart);
    const goals = data.goals || [];

    return tryPrisma(
      async () => {
        const plan = await prisma.weeklyPlan.upsert({
          where: {
            userId_weekStart: {
              userId,
              weekStart,
            },
          },
          create: {
            userId,
            weekStart,
            goals: goals as unknown as object,
            reflection: data.reflection || null,
            isLocked: false,
          },
          update: {
            goals: goals as unknown as object,
            reflection: data.reflection !== undefined ? data.reflection : undefined,
          },
        });
        return {
          id: plan.id,
          userId: plan.userId,
          weekStart: formatDateString(plan.weekStart),
          goals: (plan.goals as unknown as WeeklyGoalItem[]) || [],
          reflection: plan.reflection,
          isLocked: plan.isLocked,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        };
      },
      () => {
        const key = `${userId}_${dateStr}`;
        const existing = memWeeklyPlans.get(key);
        const plan: WeeklyPlanDTO = {
          id: existing?.id || 'wp_' + Math.random().toString(36).substring(2, 11),
          userId,
          weekStart: dateStr,
          goals,
          reflection: data.reflection !== undefined ? data.reflection : existing?.reflection || null,
          isLocked: existing?.isLocked || false,
          createdAt: existing?.createdAt || new Date(),
          updatedAt: new Date(),
        };
        memWeeklyPlans.set(key, plan);
        return plan;
      }
    );
  }

  async updateWeeklyPlan(planId: string, data: UpdateWeeklyPlanInput): Promise<WeeklyPlanDTO> {
    return tryPrisma(
      async () => {
        const plan = await prisma.weeklyPlan.update({
          where: { id: planId },
          data: {
            goals: data.goals !== undefined ? (data.goals as unknown as object) : undefined,
            reflection: data.reflection !== undefined ? data.reflection : undefined,
            isLocked: data.isLocked !== undefined ? data.isLocked : undefined,
          },
        });
        return {
          id: plan.id,
          userId: plan.userId,
          weekStart: formatDateString(plan.weekStart),
          goals: (plan.goals as unknown as WeeklyGoalItem[]) || [],
          reflection: plan.reflection,
          isLocked: plan.isLocked,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        };
      },
      () => {
        let foundKey: string | null = null;
        let existing: WeeklyPlanDTO | null = null;
        for (const [key, p] of memWeeklyPlans.entries()) {
          if (p.id === planId) {
            foundKey = key;
            existing = p;
            break;
          }
        }
        if (!existing || !foundKey) throw new Error('Weekly plan not found');
        const updated: WeeklyPlanDTO = {
          ...existing,
          goals: data.goals ?? existing.goals,
          reflection: data.reflection !== undefined ? data.reflection : existing.reflection,
          isLocked: data.isLocked ?? existing.isLocked,
          updatedAt: new Date(),
        };
        memWeeklyPlans.set(foundKey, updated);
        return updated;
      }
    );
  }
}

export const weeklyRepository = new WeeklyRepository();
