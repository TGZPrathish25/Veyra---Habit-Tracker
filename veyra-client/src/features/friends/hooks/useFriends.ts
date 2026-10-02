/** Friends and social accountability TanStack Query hooks. */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { friendsApi } from '../api/friendsApi';
import type {
  Friendship,
  FriendRequest,
  FriendProgress,
  FriendActivityFeedItem,
  SendFriendRequestPayload,
  PrivacyLevel,
} from '../types';

export function useFriends() {
  const queryClient = useQueryClient();

  const {
    data: friends = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Friendship[]>({
    queryKey: ['friends'],
    queryFn: friendsApi.getFriends,
    staleTime: 1000 * 30, // 30 seconds
  });

  const {
    data: requestsData,
    isLoading: isLoadingRequests,
    refetch: refetchRequests,
  } = useQuery<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>({
    queryKey: ['friend-requests'],
    queryFn: friendsApi.getRequests,
    staleTime: 1000 * 30,
  });

  const { data: feed = [], isLoading: isLoadingFeed } = useQuery<FriendActivityFeedItem[]>({
    queryKey: ['friend-feed'],
    queryFn: friendsApi.getFeed,
    staleTime: 1000 * 60,
  });

  const sendRequestMutation = useMutation({
    mutationFn: (payload: SendFriendRequestPayload) => friendsApi.sendRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });

  const respondMutation = useMutation({
    mutationFn: ({ requestId, action }: { requestId: string; action: 'accept' | 'reject' }) =>
      friendsApi.respondToRequest(requestId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: ({ friendId, privacyLevel }: { friendId: string; privacyLevel: PrivacyLevel }) =>
      friendsApi.updatePrivacy(friendId, privacyLevel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: (friendId: string) => friendsApi.removeFriend(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  return {
    friends,
    incomingRequests: requestsData?.incoming ?? [],
    outgoingRequests: requestsData?.outgoing ?? [],
    pendingCount: requestsData?.incoming?.length ?? 0,
    feed,
    isLoading: isLoading || isLoadingRequests,
    isLoadingFeed,
    isError,
    error,
    refetch,
    refetchRequests,
    sendRequest: sendRequestMutation.mutateAsync,
    respondToRequest: respondMutation.mutateAsync,
    updatePrivacy: updatePrivacyMutation.mutateAsync,
    removeFriend: removeFriendMutation.mutateAsync,
    isSending: sendRequestMutation.isPending,
  };
}

export function useFriendProgress(friendId: string | null) {
  return useQuery<FriendProgress>({
    queryKey: ['friend-progress', friendId],
    queryFn: () => friendsApi.getFriendProgress(friendId!),
    enabled: !!friendId,
    staleTime: 1000 * 30,
  });
}
