/** Daily recurring task CRUD, occurrences, completion toggle — business logic. */
import { tasksRepository } from './tasks.repository.js';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskDTO,
  TaskOccurrenceDTO,
  DailyOccurrencesResponse,
} from './tasks.types.js';
import { NotFoundError, ForbiddenError } from '../../lib/errors.js';
import { gamificationService } from '../gamification/gamification.service.js';
import { streaksService } from '../streaks/streaks.service.js';
import { DEFAULT_TIMEZONE, getLocalDateString } from '../../lib/time.js';

function parseDateOnly(dateStr: string): Date {
  // Midnight UTC for database Date column
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function getDayOfWeek(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
}

export class TasksService {
  async createTask(userId: string, data: CreateTaskInput): Promise<TaskDTO> {
    return tasksRepository.createTask(userId, data);
  }

  async getTasks(userId: string): Promise<TaskDTO[]> {
    return tasksRepository.findTasksByUserId(userId);
  }

  async updateTask(userId: string, taskId: string, data: UpdateTaskInput): Promise<TaskDTO> {
    const existing = await tasksRepository.findTaskById(taskId);
    if (!existing) {
      throw new NotFoundError('Task not found');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenError('You do not have permission to modify this task');
    }
    return tasksRepository.updateTask(taskId, data);
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    const existing = await tasksRepository.findTaskById(taskId);
    if (!existing) {
      throw new NotFoundError('Task not found');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this task');
    }
    await tasksRepository.deleteTask(taskId);
  }

  async getDailyOccurrences(
    userId: string,
    targetDateStr?: string,
    userTimezone = DEFAULT_TIMEZONE
  ): Promise<DailyOccurrencesResponse> {
    const todayStr = getLocalDateString(userTimezone);
    const dateStr = targetDateStr || todayStr;
    const targetDate = parseDateOnly(dateStr);
    const dayOfWeek = getDayOfWeek(dateStr);

    // 1. Fetch user's active tasks
    const activeTasks = await tasksRepository.findTasksByUserId(userId);

    // 2. Fetch already generated occurrences for target date
    let existingOccurrences = await tasksRepository.findOccurrencesByDate(userId, targetDate);
    // Ensure occurrences for deactivated tasks are filtered out
    existingOccurrences = existingOccurrences.filter((o) => o.task && o.task.isActive);

    // Ensure strict uniqueness by taskId
    const seenTaskIds = new Set<string>();
    const uniqueOccurrences: TaskOccurrenceDTO[] = [];
    for (const occ of existingOccurrences) {
      if (!seenTaskIds.has(occ.taskId)) {
        seenTaskIds.add(occ.taskId);
        uniqueOccurrences.push(occ);
      }
    }
    existingOccurrences = uniqueOccurrences;

    // 3. Lazy generation: Find tasks scheduled for today that don't have occurrences yet
    const missingTasks = activeTasks.filter((t) => {
      if (seenTaskIds.has(t.id)) return false;
      // Check if task is scheduled for this day of week
      return t.daysOfWeek.includes(dayOfWeek);
    });

    if (missingTasks.length > 0) {
      const newItems = missingTasks.map((t) => ({
        taskId: t.id,
        userId,
        date: targetDate,
      }));
      const created = await tasksRepository.createOccurrences(newItems);
      for (const occ of created) {
        if (!seenTaskIds.has(occ.taskId)) {
          seenTaskIds.add(occ.taskId);
          existingOccurrences.push(occ);
        }
      }
    }

    // Sort by task sortOrder or title
    existingOccurrences.sort((a, b) => {
      const orderA = a.task?.sortOrder ?? 0;
      const orderB = b.task?.sortOrder ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return (a.task?.title || '').localeCompare(b.task?.title || '');
    });

    const now = new Date();
    // Current time in HH:mm in user timezone
    const nowTimeParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: userTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);

    for (const occ of existingOccurrences) {
      const day = getDayOfWeek(occ.date);
      const effectiveDueTime = (occ.task?.dayDueTimes as Record<string, string>)?.[day] || occ.task?.dueTime || null;
      let isExpired = false;

      if (!occ.completed) {
        if (occ.date < todayStr) {
          isExpired = true;
        } else if (occ.date === todayStr && effectiveDueTime) {
          if (nowTimeParts > effectiveDueTime) {
            isExpired = true;
          }
        }
      }

      occ.effectiveDueTime = effectiveDueTime;
      occ.isExpired = isExpired;
    }

    const totalTasks = existingOccurrences.length;
    const completedTasks = existingOccurrences.filter((o) => o.completed).length;
    const missedTasks = existingOccurrences.filter((o) => o.isExpired).length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const isPastDate = dateStr < todayStr;
    const isToday = dateStr === todayStr;

    return {
      date: dateStr,
      occurrences: existingOccurrences,
      summary: {
        totalTasks,
        completedTasks,
        missedTasks,
        completionPercentage,
        isPastDate,
        isToday,
      },
    };
  }

  async toggleOccurrence(
    userId: string,
    occurrenceId: string,
    completedOverride?: boolean,
    userTimezone = DEFAULT_TIMEZONE
  ): Promise<{ occurrence: TaskOccurrenceDTO; xpDelta: number }> {
    const occ = await tasksRepository.findOccurrenceById(occurrenceId);
    if (!occ) {
      throw new NotFoundError('Task occurrence not found');
    }
    if (occ.userId !== userId) {
      throw new ForbiddenError('You do not have permission to modify this occurrence');
    }

    const todayStr = getLocalDateString(userTimezone);
    if (occ.date < todayStr) {
      throw new ForbiddenError('Historical task occurrences cannot be modified');
    }

    const nextCompleted = completedOverride !== undefined ? completedOverride : !occ.completed;

    // If attempting to complete, verify if the daily deadline/end time has passed
    if (nextCompleted && occ.date === todayStr) {
      const day = getDayOfWeek(occ.date);
      const effectiveDueTime = (occ.task?.dayDueTimes as Record<string, string>)?.[day] || occ.task?.dueTime || null;
      if (effectiveDueTime) {
        const now = new Date();
        const nowTimeParts = new Intl.DateTimeFormat('en-GB', {
          timeZone: userTimezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(now);

        if (nowTimeParts > effectiveDueTime) {
          throw new ForbiddenError(
            `The deadline for this habit has passed for today (due by ${effectiveDueTime}). It is marked as not done.`
          );
        }
      }
    }

    const now = new Date();
    const completedAt = nextCompleted ? now : null;
    const xpAwarded = nextCompleted ? 10 : 0;
    const xpDelta = xpAwarded - occ.xpAwarded;

    const updated = await tasksRepository.updateOccurrence(occurrenceId, {
      completed: nextCompleted,
      completedAt,
      xpAwarded,
    });

    if (nextCompleted) {
      await gamificationService.addXp(userId, 10, 1);
      const streakRes = await streaksService.recordDailyActivity(userId, occ.date);
      await gamificationService.evaluateAchievements(userId, {
        currentStreak: streakRes.streak.current,
      });
    } else {
      await gamificationService.addXp(userId, -10, -1);
    }

    return {
      occurrence: updated,
      xpDelta,
    };
  }
}

export const tasksService = new TasksService();

