/** useDailyTasks hook — TanStack Query data fetching and optimistic mutations. */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasksApi';
import type { DailyOccurrencesResponse, CreateTaskPayload } from '../types';
import { playHabitChime } from '@/lib/sound';
import { firestoreService } from '@/lib/firestoreService';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useDailyTasks(selectedDate?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['daily-occurrences', selectedDate || 'today'];

  const {
    data: dailyData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<DailyOccurrencesResponse>({
    queryKey,
    queryFn: () => tasksApi.getDailyOccurrences(selectedDate),
    staleTime: 1000 * 60, // 1 minute
  });

  const toggleMutation = useMutation({
    mutationFn: ({ occurrenceId, completed }: { occurrenceId: string; completed?: boolean }) =>
      tasksApi.toggleOccurrence(occurrenceId, completed),
    onMutate: async ({ occurrenceId, completed }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<DailyOccurrencesResponse>(queryKey);

      if (previous) {
        const nextOccurrences = previous.occurrences.map((o) => {
          if (o.id === occurrenceId) {
            const nextCompleted = completed !== undefined ? completed : !o.completed;
            if (nextCompleted) {
              playHabitChime();
            }
            return {
              ...o,
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : null,
            };
          }
          return o;
        });

        const completedCount = nextOccurrences.filter((o) => o.completed).length;
        const total = nextOccurrences.length;
        const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

        queryClient.setQueryData<DailyOccurrencesResponse>(queryKey, {
          ...previous,
          occurrences: nextOccurrences,
          summary: {
            ...previous.summary,
            completedTasks: completedCount,
            completionPercentage: percentage,
          },
        });
      }

      return { previous };
    },
    onSuccess: (data, variables) => {
      if (user?.id) {
        firestoreService
          .recordOccurrence(
            user.id,
            variables.occurrenceId,
            selectedDate || new Date().toISOString().split('T')[0],
            data.occurrence.completed
          )
          .catch(() => {});
      }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['user-me'] });
      queryClient.invalidateQueries({ queryKey: ['gamification-status'] });
      queryClient.invalidateQueries({ queryKey: ['gamification-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['streaks'] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksApi.createTask(payload),
    onSuccess: (createdTask) => {
      if (user?.id && createdTask) {
        firestoreService
          .createTask(user.id, {
            title: createdTask.title,
            category: 'DAILY',
            cadence: 'DAILY',
            color: '#7c3aed',
          })
          .catch(() => {});
      }
      queryClient.invalidateQueries({ queryKey: ['daily-occurrences'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-list'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => tasksApi.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-occurrences'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-list'] });
    },
  });

  return {
    dailyData,
    occurrences: dailyData?.occurrences || [],
    summary: dailyData?.summary || {
      totalTasks: 0,
      completedTasks: 0,
      completionPercentage: 0,
      isPastDate: false,
      isToday: true,
    },
    isLoading,
    isError,
    error,
    refetch,
    toggleOccurrence: (occurrenceId: string, completed?: boolean) =>
      toggleMutation.mutate({ occurrenceId, completed }),
    isToggling: toggleMutation.isPending,
    createTask: createTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
    deleteTask: deleteTaskMutation.mutateAsync,
    isDeleting: deleteTaskMutation.isPending,
  };
}
