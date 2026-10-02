import { prisma, tryPrisma } from '../../db/prisma.js';
import type { TaskDTO, CreateTaskInput, UpdateTaskInput, TaskOccurrenceDTO } from './tasks.types.js';

// In-memory storage for development when PostgreSQL is not running
const memTasks = new Map<string, TaskDTO>();
const memOccurrences = new Map<string, TaskOccurrenceDTO>();

function formatDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

export class TasksRepository {
  async findTasksByUserId(userId: string): Promise<TaskDTO[]> {
    return tryPrisma(
      async () => {
        const tasks = await prisma.task.findMany({
          where: { userId, isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
        return tasks.map((t) => ({
          ...t,
          daysOfWeek: t.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
        })) as TaskDTO[];
      },
      () => {
        return Array.from(memTasks.values())
          .filter((t) => t.userId === userId && t.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime());
      }
    );
  }

  async findTaskById(taskId: string): Promise<TaskDTO | null> {
    return tryPrisma(
      async () => {
        const t = await prisma.task.findUnique({
          where: { id: taskId },
        });
        if (!t) return null;
        return {
          ...t,
          daysOfWeek: t.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
        } as TaskDTO;
      },
      () => {
        return memTasks.get(taskId) || null;
      }
    );
  }

  async createTask(userId: string, data: CreateTaskInput): Promise<TaskDTO> {
    return tryPrisma(
      async () => {
        const t = await prisma.task.create({
          data: {
            userId,
            title: data.title,
            description: data.description || null,
            emoji: data.emoji || null,
            color: data.color || null,
            isRecurring: data.isRecurring ?? true,
            daysOfWeek: data.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
            sortOrder: data.sortOrder || 0,
            isActive: true,
          },
        });
        return {
          ...t,
          daysOfWeek: t.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
        } as TaskDTO;
      },
      () => {
        const id = 'tsk_' + Math.random().toString(36).substring(2, 11);
        const newTask: TaskDTO = {
          id,
          userId,
          title: data.title,
          description: data.description || null,
          emoji: data.emoji || null,
          color: data.color || null,
          isRecurring: data.isRecurring ?? true,
          daysOfWeek: data.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
          isActive: true,
          sortOrder: data.sortOrder || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memTasks.set(id, newTask);
        return newTask;
      }
    );
  }

  async updateTask(taskId: string, data: UpdateTaskInput): Promise<TaskDTO> {
    return tryPrisma(
      async () => {
        const t = await prisma.task.update({
          where: { id: taskId },
          data: {
            ...data,
            daysOfWeek: data.daysOfWeek ? data.daysOfWeek : undefined,
          },
        });
        return {
          ...t,
          daysOfWeek: t.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
        } as TaskDTO;
      },
      () => {
        const existing = memTasks.get(taskId);
        if (!existing) throw new Error('Task not found');
        const updated: TaskDTO = {
          ...existing,
          title: data.title ?? existing.title,
          description: data.description !== undefined ? data.description : existing.description,
          emoji: data.emoji !== undefined ? data.emoji : existing.emoji,
          color: data.color !== undefined ? data.color : existing.color,
          isRecurring: data.isRecurring ?? existing.isRecurring,
          daysOfWeek: data.daysOfWeek ?? existing.daysOfWeek,
          isActive: data.isActive ?? existing.isActive,
          sortOrder: data.sortOrder ?? existing.sortOrder,
          updatedAt: new Date(),
        };
        memTasks.set(taskId, updated);
        return updated;
      }
    );
  }

  async deleteTask(taskId: string): Promise<void> {
    return tryPrisma(
      async () => {
        await prisma.task.update({
          where: { id: taskId },
          data: { isActive: false },
        });
      },
      () => {
        const existing = memTasks.get(taskId);
        if (existing) {
          memTasks.set(taskId, { ...existing, isActive: false, updatedAt: new Date() });
        }
      }
    );
  }

  async findOccurrencesByDate(userId: string, date: Date): Promise<TaskOccurrenceDTO[]> {
    const dateStr = formatDateString(date);
    return tryPrisma(
      async () => {
        const occs = await prisma.taskOccurrence.findMany({
          where: {
            userId,
            date,
          },
          include: {
            task: true,
          },
        });
        return occs.map((o) => ({
          id: o.id,
          taskId: o.taskId,
          userId: o.userId,
          date: formatDateString(o.date),
          completed: o.completed,
          completedAt: o.completedAt,
          xpAwarded: o.xpAwarded,
          task: o.task
            ? {
                ...o.task,
                daysOfWeek: o.task.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
              }
            : undefined,
        })) as TaskOccurrenceDTO[];
      },
      () => {
        const results: TaskOccurrenceDTO[] = [];
        for (const occ of memOccurrences.values()) {
          if (occ.userId === userId && occ.date === dateStr) {
            const task = memTasks.get(occ.taskId);
            results.push({
              ...occ,
              task,
            });
          }
        }
        return results;
      }
    );
  }

  async findOccurrenceById(occurrenceId: string): Promise<TaskOccurrenceDTO | null> {
    return tryPrisma(
      async () => {
        const occ = await prisma.taskOccurrence.findUnique({
          where: { id: occurrenceId },
          include: { task: true },
        });
        if (!occ) return null;
        return {
          id: occ.id,
          taskId: occ.taskId,
          userId: occ.userId,
          date: formatDateString(occ.date),
          completed: occ.completed,
          completedAt: occ.completedAt,
          xpAwarded: occ.xpAwarded,
          task: occ.task
            ? {
                ...occ.task,
                daysOfWeek: occ.task.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
              }
            : undefined,
        } as TaskOccurrenceDTO;
      },
      () => {
        const occ = memOccurrences.get(occurrenceId);
        if (!occ) return null;
        return {
          ...occ,
          task: memTasks.get(occ.taskId),
        };
      }
    );
  }

  async createOccurrences(
    occurrences: { taskId: string; userId: string; date: Date }[]
  ): Promise<TaskOccurrenceDTO[]> {
    if (occurrences.length === 0) return [];

    return tryPrisma(
      async () => {
        const created: TaskOccurrenceDTO[] = [];
        for (const item of occurrences) {
          const occ = await prisma.taskOccurrence.upsert({
            where: {
              taskId_date: {
                taskId: item.taskId,
                date: item.date,
              },
            },
            create: {
              taskId: item.taskId,
              userId: item.userId,
              date: item.date,
              completed: false,
              xpAwarded: 0,
            },
            update: {},
            include: { task: true },
          });
          created.push({
            id: occ.id,
            taskId: occ.taskId,
            userId: occ.userId,
            date: formatDateString(occ.date),
            completed: occ.completed,
            completedAt: occ.completedAt,
            xpAwarded: occ.xpAwarded,
            task: occ.task
              ? {
                  ...occ.task,
                  daysOfWeek: occ.task.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
                }
              : undefined,
          });
        }
        return created;
      },
      () => {
        const created: TaskOccurrenceDTO[] = [];
        for (const item of occurrences) {
          const dateStr = formatDateString(item.date);
          const key = `${item.taskId}_${dateStr}`;
          let occ = memOccurrences.get(key);
          if (!occ) {
            occ = {
              id: 'occ_' + Math.random().toString(36).substring(2, 11),
              taskId: item.taskId,
              userId: item.userId,
              date: dateStr,
              completed: false,
              completedAt: null,
              xpAwarded: 0,
              task: memTasks.get(item.taskId),
            };
            memOccurrences.set(key, occ);
            memOccurrences.set(occ.id, occ);
          }
          created.push(occ);
        }
        return created;
      }
    );
  }

  async updateOccurrence(
    occurrenceId: string,
    data: { completed: boolean; completedAt: Date | null; xpAwarded: number }
  ): Promise<TaskOccurrenceDTO> {
    return tryPrisma(
      async () => {
        const occ = await prisma.taskOccurrence.update({
          where: { id: occurrenceId },
          data,
          include: { task: true },
        });
        return {
          id: occ.id,
          taskId: occ.taskId,
          userId: occ.userId,
          date: formatDateString(occ.date),
          completed: occ.completed,
          completedAt: occ.completedAt,
          xpAwarded: occ.xpAwarded,
          task: occ.task
            ? {
                ...occ.task,
                daysOfWeek: occ.task.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
              }
            : undefined,
        } as TaskOccurrenceDTO;
      },
      () => {
        const occ = memOccurrences.get(occurrenceId);
        if (!occ) throw new Error('Occurrence not found');
        const updated: TaskOccurrenceDTO = {
          ...occ,
          completed: data.completed,
          completedAt: data.completedAt,
          xpAwarded: data.xpAwarded,
        };
        memOccurrences.set(occurrenceId, updated);
        const compositeKey = `${occ.taskId}_${occ.date}`;
        memOccurrences.set(compositeKey, updated);
        return updated;
      }
    );
  }
}

export const tasksRepository = new TasksRepository();
