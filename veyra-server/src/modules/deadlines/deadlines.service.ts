/** Deadline monitoring and urgency classification business logic. */
import type { UrgencyLevel, TaskDeadlineStatus, DeadlineStatusResponse } from './deadlines.types.js';
import { tasksRepository } from '../tasks/tasks.repository.js';

export function calculateUrgency(now: Date, dueAt: Date): { minutesRemaining: number; urgency: UrgencyLevel } {
  const diffMs = dueAt.getTime() - now.getTime();
  const minutesRemaining = Math.floor(diffMs / (60 * 1000));

  if (minutesRemaining < 0) {
    return { minutesRemaining, urgency: 'overdue' };
  }
  if (minutesRemaining <= 30) {
    return { minutesRemaining, urgency: 'urgent' };
  }
  if (minutesRemaining <= 180) {
    return { minutesRemaining, urgency: 'approaching' };
  }
  return { minutesRemaining, urgency: 'normal' };
}

export class DeadlinesService {
  async getStatusForUser(userId: string, now = new Date()): Promise<DeadlineStatusResponse> {
    const todayStr = now.toISOString().split('T')[0];
    const occurrences = await tasksRepository.findOccurrencesByDate(userId, new Date(todayStr));

    const deadlines: TaskDeadlineStatus[] = [];

    // End-of-day default deadline: 23:59:59 local/UTC
    for (const occ of occurrences) {
      if (occ.completed) continue;

      const [y, m, d] = occ.date.split('-').map(Number);
      // Default to 23:59 on the occurrence date
      const dueAt = new Date(Date.UTC(y, m - 1, d, 23, 59, 59));
      const { minutesRemaining, urgency } = calculateUrgency(now, dueAt);

      deadlines.push({
        taskId: occ.taskId,
        occurrenceId: occ.id,
        title: occ.task?.title || 'Daily Task',
        emoji: occ.task?.emoji || null,
        dueAt,
        minutesRemaining,
        urgency,
        completed: occ.completed,
      });
    }

    // Sort by urgency priority (urgent first, then approaching, then overdue, then normal)
    const priorityWeight: Record<UrgencyLevel, number> = {
      urgent: 1,
      approaching: 2,
      overdue: 3,
      normal: 4,
    };

    deadlines.sort((a, b) => {
      const pDiff = priorityWeight[a.urgency] - priorityWeight[b.urgency];
      if (pDiff !== 0) return pDiff;
      return a.minutesRemaining - b.minutesRemaining;
    });

    const counts = {
      urgent: deadlines.filter((d) => d.urgency === 'urgent').length,
      approaching: deadlines.filter((d) => d.urgency === 'approaching').length,
      normal: deadlines.filter((d) => d.urgency === 'normal').length,
      overdue: deadlines.filter((d) => d.urgency === 'overdue').length,
    };

    return {
      counts,
      deadlines,
    };
  }
}

export const deadlinesService = new DeadlinesService();
