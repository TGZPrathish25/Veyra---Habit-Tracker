/** Tasks and occurrences API calls with Cloud Firestore seamless fallback. */
import { apiClient } from '@/lib/apiClient';
import { firestoreService } from '@/lib/firestoreService';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { Task, TaskOccurrence, DailyOccurrencesResponse, CreateTaskPayload } from '../types';

interface ApiResponse<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

export const tasksApi = {
  getTasks: async (): Promise<Task[]> => {
    try {
      const res = await apiClient.get<ApiResponse<Task[]>>('/tasks');
      return res.data.data;
    } catch (err) {
      const user = useAuthStore.getState().user;
      if (user?.id) {
        const firestoreTasks = await firestoreService.getUserTasks(user.id);
        return firestoreTasks.map((t) => ({
          id: t.id || `task_${Date.now()}`,
          userId: user.id,
          title: t.title,
          description: null,
          emoji: '⭐',
          color: t.color || '#3b82f6',
          isRecurring: true,
          daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
          isActive: !t.archived,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      }
      throw err;
    }
  },

  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    try {
      const res = await apiClient.post<ApiResponse<Task>>('/tasks', payload);
      return res.data.data;
    } catch (err) {
      const user = useAuthStore.getState().user;
      if (user?.id) {
        const docId = await firestoreService.createTask(user.id, {
          title: payload.title,
          category: 'DAILY',
          cadence: 'DAILY',
          color: payload.color || '#3b82f6',
        });
        return {
          id: docId || `task_${Date.now()}`,
          userId: user.id,
          title: payload.title,
          description: payload.description || null,
          emoji: payload.emoji || '⭐',
          color: payload.color || '#3b82f6',
          isRecurring: payload.isRecurring ?? true,
          daysOfWeek: payload.daysOfWeek || [1, 2, 3, 4, 5, 6, 7],
          isActive: true,
          sortOrder: payload.sortOrder || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      throw err;
    }
  },

  updateTask: async (id: string, payload: Partial<CreateTaskPayload>): Promise<Task> => {
    try {
      const res = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}`, payload);
      return res.data.data;
    } catch (err) {
      const user = useAuthStore.getState().user;
      if (user?.id) {
        await firestoreService.updateTask(id, {
          title: payload.title,
          color: payload.color || undefined,
        });
        return {
          id,
          userId: user.id,
          title: payload.title || 'Updated Task',
          description: payload.description || null,
          emoji: payload.emoji || '⭐',
          color: payload.color || '#3b82f6',
          isRecurring: payload.isRecurring ?? true,
          daysOfWeek: payload.daysOfWeek || [1, 2, 3, 4, 5, 6, 7],
          isActive: true,
          sortOrder: payload.sortOrder || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      throw err;
    }
  },

  deleteTask: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/tasks/${id}`);
    } catch (err) {
      await firestoreService.deleteTask(id);
    }
  },

  getDailyOccurrences: async (date?: string): Promise<DailyOccurrencesResponse> => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const params = date ? { date } : {};
      const res = await apiClient.get<ApiResponse<DailyOccurrencesResponse>>('/tasks/occurrences', { params });
      return res.data.data;
    } catch (err) {
      const user = useAuthStore.getState().user;
      if (user?.id) {
        // Fallback to Cloud Firestore
        await firestoreService.provisionDefaultsIfEmpty(user.id);
        const tasks = await firestoreService.getUserTasks(user.id);
        const occurrences = await firestoreService.getDailyOccurrences(user.id, targetDate);
        const occMap = new Map(occurrences.map((o) => [o.taskId, o]));

        const synthesizedOccurrences: TaskOccurrence[] = tasks.map((t) => {
          const recorded = t.id ? occMap.get(t.id) : undefined;
          return {
            id: recorded?.id || `occ_${user.id}_${t.id}_${targetDate}`,
            taskId: t.id || 't1',
            userId: user.id,
            date: targetDate,
            completed: recorded ? recorded.completed : false,
            completedAt: (recorded?.completedAt as string) || null,
            xpAwarded: recorded?.completed ? 10 : 0,
            task: {
              id: t.id || 't1',
              userId: user.id,
              title: t.title,
              description: null,
              emoji: '⭐',
              color: t.color || '#3b82f6',
              isRecurring: true,
              daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
              isActive: !t.archived,
              sortOrder: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          };
        });

        const completedCount = synthesizedOccurrences.filter((o) => o.completed).length;
        const total = synthesizedOccurrences.length;
        const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

        return {
          date: targetDate,
          occurrences: synthesizedOccurrences,
          summary: {
            totalTasks: total,
            completedTasks: completedCount,
            completionPercentage: pct,
            isPastDate: targetDate < todayStr,
            isToday: targetDate === todayStr,
          },
        };
      }
      throw err;
    }
  },

  toggleOccurrence: async (
    occurrenceId: string,
    completed?: boolean
  ): Promise<{ occurrence: TaskOccurrence; xpDelta?: number }> => {
    try {
      const res = await apiClient.post<ApiResponse<TaskOccurrence>>(
        `/tasks/occurrences/${occurrenceId}/toggle`,
        { completed }
      );
      return {
        occurrence: res.data.data,
        xpDelta: res.data.meta?.xpDelta as number | undefined,
      };
    } catch (err) {
      const user = useAuthStore.getState().user;
      if (user?.id) {
        const isCompleted = completed !== undefined ? completed : true;
        const targetDate = new Date().toISOString().split('T')[0];
        await firestoreService.recordOccurrence(user.id, occurrenceId, targetDate, isCompleted);
        await firestoreService.addXp(user.id, isCompleted ? 10 : 0);

        return {
          occurrence: {
            id: occurrenceId,
            taskId: occurrenceId,
            userId: user.id,
            date: targetDate,
            completed: isCompleted,
            completedAt: isCompleted ? new Date().toISOString() : null,
            xpAwarded: isCompleted ? 10 : 0,
          },
          xpDelta: isCompleted ? 10 : 0,
        };
      }
      throw err;
    }
  },
};

