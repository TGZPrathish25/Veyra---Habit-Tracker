import { prisma, tryPrisma } from '../../db/prisma.js';
import type {
  MonthlyPlanDTO,
  MonthlySnapshotDTO,
  CreateMonthlyPlanInput,
  UpdateMonthlyPlanInput,
  MonthlyGoalItem,
} from './monthly.types.js';

const memMonthlyPlans = new Map<string, MonthlyPlanDTO>();
const memSnapshots = new Map<string, MonthlySnapshotDTO>();

export class MonthlyRepository {
  async findByUserAndMonth(userId: string, year: number, month: number): Promise<MonthlyPlanDTO | null> {
    return tryPrisma(
      async () => {
        const plan = await prisma.monthlyPlan.findUnique({
          where: {
            userId_year_month: {
              userId,
              year,
              month,
            },
          },
        });
        if (!plan) return null;
        return {
          id: plan.id,
          userId: plan.userId,
          year: plan.year,
          month: plan.month,
          goals: (plan.goals as unknown as MonthlyGoalItem[]) || [],
          reflection: plan.reflection,
          isLocked: plan.isLocked,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        };
      },
      () => {
        const key = `${userId}_${year}_${month}`;
        return memMonthlyPlans.get(key) || null;
      }
    );
  }

  async findById(planId: string): Promise<MonthlyPlanDTO | null> {
    return tryPrisma(
      async () => {
        const plan = await prisma.monthlyPlan.findUnique({
          where: { id: planId },
        });
        if (!plan) return null;
        return {
          id: plan.id,
          userId: plan.userId,
          year: plan.year,
          month: plan.month,
          goals: (plan.goals as unknown as MonthlyGoalItem[]) || [],
          reflection: plan.reflection,
          isLocked: plan.isLocked,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        };
      },
      () => {
        for (const p of memMonthlyPlans.values()) {
          if (p.id === planId) return p;
        }
        return null;
      }
    );
  }

  async upsertMonthlyPlan(
    userId: string,
    year: number,
    month: number,
    data: CreateMonthlyPlanInput
  ): Promise<MonthlyPlanDTO> {
    const goals = data.goals || [];

    return tryPrisma(
      async () => {
        const plan = await prisma.monthlyPlan.upsert({
          where: {
            userId_year_month: {
              userId,
              year,
              month,
            },
          },
          create: {
            userId,
            year,
            month,
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
          year: plan.year,
          month: plan.month,
          goals: (plan.goals as unknown as MonthlyGoalItem[]) || [],
          reflection: plan.reflection,
          isLocked: plan.isLocked,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        };
      },
      () => {
        const key = `${userId}_${year}_${month}`;
        const existing = memMonthlyPlans.get(key);
        const plan: MonthlyPlanDTO = {
          id: existing?.id || 'mp_' + Math.random().toString(36).substring(2, 11),
          userId,
          year,
          month,
          goals,
          reflection: data.reflection !== undefined ? data.reflection : existing?.reflection || null,
          isLocked: existing?.isLocked || false,
          createdAt: existing?.createdAt || new Date(),
          updatedAt: new Date(),
        };
        memMonthlyPlans.set(key, plan);
        return plan;
      }
    );
  }

  async updateMonthlyPlan(planId: string, data: UpdateMonthlyPlanInput): Promise<MonthlyPlanDTO> {
    return tryPrisma(
      async () => {
        const plan = await prisma.monthlyPlan.update({
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
          year: plan.year,
          month: plan.month,
          goals: (plan.goals as unknown as MonthlyGoalItem[]) || [],
          reflection: plan.reflection,
          isLocked: plan.isLocked,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        };
      },
      () => {
        let foundKey: string | null = null;
        let existing: MonthlyPlanDTO | null = null;
        for (const [key, p] of memMonthlyPlans.entries()) {
          if (p.id === planId) {
            foundKey = key;
            existing = p;
            break;
          }
        }
        if (!existing || !foundKey) throw new Error('Monthly plan not found');
        const updated: MonthlyPlanDTO = {
          ...existing,
          goals: data.goals ?? existing.goals,
          reflection: data.reflection !== undefined ? data.reflection : existing.reflection,
          isLocked: data.isLocked ?? existing.isLocked,
          updatedAt: new Date(),
        };
        memMonthlyPlans.set(foundKey, updated);
        return updated;
      }
    );
  }

  async createSnapshot(snapshot: Omit<MonthlySnapshotDTO, 'id' | 'createdAt'>): Promise<MonthlySnapshotDTO> {
    return tryPrisma(
      async () => {
        const s = await prisma.monthlySnapshot.upsert({
          where: {
            userId_year_month: {
              userId: snapshot.userId,
              year: snapshot.year,
              month: snapshot.month,
            },
          },
          create: snapshot,
          update: snapshot,
        });
        return s as unknown as MonthlySnapshotDTO;
      },
      () => {
        const key = `${snapshot.userId}_${snapshot.year}_${snapshot.month}`;
        const record: MonthlySnapshotDTO = {
          id: 'snp_' + Math.random().toString(36).substring(2, 11),
          ...snapshot,
          createdAt: new Date(),
        };
        memSnapshots.set(key, record);
        return record;
      }
    );
  }
}

export const monthlyRepository = new MonthlyRepository();
