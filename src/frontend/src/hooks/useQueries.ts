import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type WritingPost, type UserProfile, type WritingType, type PostVisibility, ExternalBlob, type ShoppingItem } from '../backend';

export function useGetAllPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<WritingPost[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPost(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<WritingPost>({
    queryKey: ['post', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPost(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useGetPostsByType(writingType: WritingType) {
  const { actor, isFetching } = useActor();

  return useQuery<WritingPost[]>({
    queryKey: ['posts', writingType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPostsByType(writingType);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      message,
      image,
      writingType,
      visibility,
    }: {
      id: string;
      title: string;
      message: string | null;
      image: ExternalBlob;
      writingType: WritingType;
      visibility: PostVisibility;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPost(id, title, message, image, writingType, visibility);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Stripe subscription hooks

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useIsUserSubscribed() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['subscription', 'status'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isUserSubscribed();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/pricing?canceled=true`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      // JSON parsing is important!
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}

export function useVerifyCheckoutSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error('Actor not available');
      const status = await actor.getStripeSessionStatus(sessionId);
      if (status.__kind__ === 'failed') {
        throw new Error(status.failed.error);
      }
      return status;
    },
    onSuccess: () => {
      // Invalidate the exact subscription status query key to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['subscription', 'status'] });
    },
  });
}
