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

function getLocalDateString(timezone = 'UTC', dateObj = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj);
  } catch {
    return dateObj.toISOString().split('T')[0];
  }
}

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
    userTimezone = 'UTC'
  ): Promise<DailyOccurrencesResponse> {
    const todayStr = getLocalDateString(userTimezone);
    const dateStr = targetDateStr || todayStr;
    const targetDate = parseDateOnly(dateStr);
    const dayOfWeek = getDayOfWeek(dateStr);

    // 1. Fetch user's active tasks
    const activeTasks = await tasksRepository.findTasksByUserId(userId);

    // 2. Fetch already generated occurrences for target date
    let existingOccurrences = await tasksRepository.findOccurrencesByDate(userId, targetDate);

    // 3. Lazy generation: Find tasks scheduled for today that don't have occurrences yet
    const existingTaskIds = new Set(existingOccurrences.map((o) => o.taskId));
    const missingTasks = activeTasks.filter((t) => {
      if (existingTaskIds.has(t.id)) return false;
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
      existingOccurrences = [...existingOccurrences, ...created];
    }

    // Sort by task sortOrder or title
    existingOccurrences.sort((a, b) => {
      const orderA = a.task?.sortOrder ?? 0;
      const orderB = b.task?.sortOrder ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return (a.task?.title || '').localeCompare(b.task?.title || '');
    });

    const totalTasks = existingOccurrences.length;
    const completedTasks = existingOccurrences.filter((o) => o.completed).length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const isPastDate = dateStr < todayStr;
    const isToday = dateStr === todayStr;

    return {
      date: dateStr,
      occurrences: existingOccurrences,
      summary: {
        totalTasks,
        completedTasks,
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
    userTimezone = 'UTC'
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

