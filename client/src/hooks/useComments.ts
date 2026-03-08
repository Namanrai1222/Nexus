import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '../api/commentApi';
import toast from 'react-hot-toast';

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data } = await commentApi.getByPost(postId);
      return data.data;
    },
    enabled: !!postId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { body: string; postId: string; parentId?: string }) =>
      commentApi.create(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
      toast.success('Comment posted!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to post comment');
    },
  });
}

export function useVoteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, value }: { commentId: string; value: 1 | -1 }) =>
      commentApi.vote(commentId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentApi.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comment deleted');
    },
  });
}
