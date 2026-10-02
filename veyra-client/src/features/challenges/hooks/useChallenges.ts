/** Challenges TanStack Query hooks. */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengesApi } from '../api/challengesApi';
import type {
  Challenge,
  ChallengeParticipant,
  CreateChallengePayload,
  UpdateChallengeProgressPayload,
} from '../types';

export function useChallenges(filter?: 'all' | 'active' | 'my') {
  const queryClient = useQueryClient();
  const queryKey = ['challenges', filter || 'all'];

  const {
    data: challenges = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Challenge[]>({
    queryKey,
    queryFn: () => challengesApi.getChallenges(filter),
    staleTime: 1000 * 30,
  });

  const createChallengeMutation = useMutation({
    mutationFn: (payload: CreateChallengePayload) => challengesApi.createChallenge(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });

  const joinChallengeMutation = useMutation({
    mutationFn: (id: string) => challengesApi.joinChallenge(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge', id] });
    },
  });

  const leaveChallengeMutation = useMutation({
    mutationFn: (id: string) => challengesApi.leaveChallenge(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge', id] });
    },
  });

  return {
    challenges,
    isLoading,
    isError,
    error,
    refetch,
    createChallenge: createChallengeMutation.mutateAsync,
    joinChallenge: joinChallengeMutation.mutateAsync,
    leaveChallenge: leaveChallengeMutation.mutateAsync,
    isCreating: createChallengeMutation.isPending,
  };
}

export function useChallenge(id: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ['challenge', id];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<{ challenge: Challenge; participants: ChallengeParticipant[] }>({
    queryKey,
    queryFn: () => challengesApi.getChallenge(id!),
    enabled: !!id,
    staleTime: 1000 * 30,
  });

  const updateProgressMutation = useMutation({
    mutationFn: (payload: UpdateChallengeProgressPayload) =>
      challengesApi.updateProgress(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['gamification-status'] });
    },
  });

  return {
    challenge: data?.challenge,
    participants: data?.participants ?? [],
    isLoading,
    isError,
    error,
    refetch,
    updateProgress: updateProgressMutation.mutateAsync,
    isUpdating: updateProgressMutation.isPending,
  };
}
