import { prisma, tryPrisma } from '../../db/prisma.js';
import { persistentStore } from '../../db/persistentStore.js';
import type { TaskDTO, CreateTaskInput, UpdateTaskInput, TaskOccurrenceDTO } from './tasks.types.js';

// In-memory storage for development when PostgreSQL is not running
const memTasks = new Map<string, TaskDTO>();
const memOccurrences = new Map<string, TaskOccurrenceDTO>();
const memOccurrenceByTaskDate = new Map<string, string>();

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
          dueTime: t.dueTime || null,
          dayDueTimes: (t.dayDueTimes as Record<string, string>) || null,
        })) as TaskDTO[];
      },
      async () => {
        let tasks = Array.from(memTasks.values()).filter((t) => t.userId === userId && t.isActive);
        if (tasks.length === 0) {
          const stored = await persistentStore.getTasksByUser(userId);
          for (const s of stored) {
            const t: TaskDTO = {
              ...s,
              dueTime: s.dueTime || null,
              dayDueTimes: s.dayDueTimes || null,
              createdAt: new Date(s.createdAt),
              updatedAt: new Date(s.updatedAt),
            };
            memTasks.set(t.id, t);
          }
          tasks = Array.from(memTasks.values()).filter((t) => t.userId === userId && t.isActive);
        }
        return tasks.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime());
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
          dueTime: t.dueTime || null,
          dayDueTimes: (t.dayDueTimes as Record<string, string>) || null,
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
            dueTime: data.dueTime || null,
            dayDueTimes: (data.dayDueTimes as any) || null,
            sortOrder: data.sortOrder || 0,
            isActive: true,
          },
        });
        return {
          ...t,
          daysOfWeek: t.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
          dueTime: t.dueTime || null,
          dayDueTimes: (t.dayDueTimes as Record<string, string>) || null,
        } as TaskDTO;
      },
      async () => {
        const id = 'tsk_' + Math.random().toString(36).substring(2, 11);
        const now = new Date();
        const newTask: TaskDTO = {
          id,
          userId,
          title: data.title,
          description: data.description || null,
          emoji: data.emoji || null,
          color: data.color || null,
          isRecurring: data.isRecurring ?? true,
          daysOfWeek: data.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
          dueTime: data.dueTime || null,
          dayDueTimes: data.dayDueTimes || null,
          isActive: true,
          sortOrder: data.sortOrder || 0,
          createdAt: now,
          updatedAt: now,
        };
        memTasks.set(id, newTask);
        await persistentStore.saveTask({
          id: newTask.id,
          userId: newTask.userId,
          title: newTask.title,
          description: newTask.description,
          emoji: newTask.emoji,
          color: newTask.color,
          isRecurring: newTask.isRecurring,
          daysOfWeek: newTask.daysOfWeek,
          dueTime: newTask.dueTime,
          dayDueTimes: newTask.dayDueTimes,
          isActive: newTask.isActive,
          sortOrder: newTask.sortOrder,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        });
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
            dueTime: data.dueTime !== undefined ? data.dueTime : undefined,
            dayDueTimes: data.dayDueTimes !== undefined ? (data.dayDueTimes as any) : undefined,
          },
        });
        return {
          ...t,
          daysOfWeek: t.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
          dueTime: t.dueTime || null,
          dayDueTimes: (t.dayDueTimes as Record<string, string>) || null,
        } as TaskDTO;
      },
      async () => {
        const existing = memTasks.get(taskId);
        if (!existing) throw new Error('Task not found');
        const now = new Date();
        const updated: TaskDTO = {
          ...existing,
          title: data.title ?? existing.title,
          description: data.description !== undefined ? data.description : existing.description,
          emoji: data.emoji !== undefined ? data.emoji : existing.emoji,
          color: data.color !== undefined ? data.color : existing.color,
          isRecurring: data.isRecurring ?? existing.isRecurring,
          daysOfWeek: data.daysOfWeek ?? existing.daysOfWeek,
          dueTime: data.dueTime !== undefined ? data.dueTime : existing.dueTime,
          dayDueTimes: data.dayDueTimes !== undefined ? data.dayDueTimes : existing.dayDueTimes,
          isActive: data.isActive ?? existing.isActive,
          sortOrder: data.sortOrder ?? existing.sortOrder,
          updatedAt: now,
        };
        memTasks.set(taskId, updated);
        await persistentStore.saveTask({
          id: updated.id,
          userId: updated.userId,
          title: updated.title,
          description: updated.description,
          emoji: updated.emoji,
          color: updated.color,
          isRecurring: updated.isRecurring,
          daysOfWeek: updated.daysOfWeek,
          dueTime: updated.dueTime,
          dayDueTimes: updated.dayDueTimes,
          isActive: updated.isActive,
          sortOrder: updated.sortOrder,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: now.toISOString(),
        });
        return updated;
      }
    );
  }

  async deleteTask(taskId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tryPrisma(
      async () => {
        // Delete only future uncompleted occurrences (or uncompleted today).
        // PAST occurrences and COMPLETED occurrences are strictly preserved in task history!
        await prisma.taskOccurrence.deleteMany({
          where: {
            taskId,
            OR: [
              { date: { gt: today } },
              { date: { gte: today }, completed: false },
            ],
          },
        });
        await prisma.task.update({
          where: { id: taskId },
          data: { isActive: false },
        });
      },
      async () => {
        const existing = memTasks.get(taskId);
        if (existing) {
          memTasks.set(taskId, { ...existing, isActive: false, updatedAt: new Date() });
        }
        await persistentStore.deleteTask(taskId);
        for (const [key, occId] of Array.from(memOccurrenceByTaskDate.entries())) {
          const occ = memOccurrences.get(occId);
          if (occ && occ.taskId === taskId) {
            const occDate = new Date(occ.date);
            occDate.setHours(0, 0, 0, 0);
            const isFutureOrUncompleted =
              occDate > today || (occDate.getTime() === today.getTime() && !occ.completed);
            if (isFutureOrUncompleted) {
              memOccurrenceByTaskDate.delete(key);
              memOccurrences.delete(occId);
            }
          }
        }
        for (const [occId, occ] of Array.from(memOccurrences.entries())) {
          if (occ.taskId === taskId) {
            const occDate = new Date(occ.date);
            occDate.setHours(0, 0, 0, 0);
            const isFutureOrUncompleted =
              occDate > today || (occDate.getTime() === today.getTime() && !occ.completed);
            if (isFutureOrUncompleted) {
              memOccurrences.delete(occId);
            }
          }
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
                dueTime: o.task.dueTime || null,
                dayDueTimes: (o.task.dayDueTimes as Record<string, string>) || null,
              }
            : undefined,
        })) as TaskOccurrenceDTO[];
      },
      () => {
        const results: TaskOccurrenceDTO[] = [];
        for (const occ of memOccurrences.values()) {
          if (occ.userId === userId && occ.date === dateStr) {
            const task = memTasks.get(occ.taskId);
            if (task) {
              results.push({
                ...occ,
                task,
              });
            }
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
                dueTime: occ.task.dueTime || null,
                dayDueTimes: (occ.task.dayDueTimes as Record<string, string>) || null,
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
                  dueTime: occ.task.dueTime || null,
                  dayDueTimes: (occ.task.dayDueTimes as Record<string, string>) || null,
                }
              : undefined,
          });
        }
        return created;
      },
      async () => {
        const created: TaskOccurrenceDTO[] = [];
        for (const item of occurrences) {
          const dateStr = formatDateString(item.date);
          const key = `${item.taskId}_${dateStr}`;
          const existingId = memOccurrenceByTaskDate.get(key);
          let occ = existingId ? memOccurrences.get(existingId) : undefined;
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
            memOccurrences.set(occ.id, occ);
            memOccurrenceByTaskDate.set(key, occ.id);
            await persistentStore.saveOccurrence({
              id: occ.id,
              taskId: occ.taskId,
              userId: occ.userId,
              date: occ.date,
              completed: occ.completed,
              completedAt: null,
              xpAwarded: occ.xpAwarded,
            });
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
      async () => {
        const occ = memOccurrences.get(occurrenceId);
        if (!occ) throw new Error('Occurrence not found');
        const updated: TaskOccurrenceDTO = {
          ...occ,
          completed: data.completed,
          completedAt: data.completedAt,
          xpAwarded: data.xpAwarded,
        };
        memOccurrences.set(occurrenceId, updated);
        await persistentStore.saveOccurrence({
          id: updated.id,
          taskId: updated.taskId,
          userId: updated.userId,
          date: updated.date,
          completed: updated.completed,
          completedAt: updated.completedAt ? updated.completedAt.toISOString() : null,
          xpAwarded: updated.xpAwarded,
        });
        return updated;
      }
    );
  }
}

export const tasksRepository = new TasksRepository();
