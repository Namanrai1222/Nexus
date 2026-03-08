import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '../api/postApi';
import toast from 'react-hot-toast';

interface UsePostsOptions {
  page?: number;
  limit?: number;
  sort?: 'hot' | 'new' | 'top';
  community?: string;
  tag?: string;
}

export function usePosts(options: UsePostsOptions = {}) {
  return useQuery({
    queryKey: ['posts', options],
    queryFn: async () => {
      const { data } = await postApi.getAll(options);
      return data.data;
    },
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const { data } = await postApi.getBySlug(slug);
      return data.data;
    },
    enabled: !!slug,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => postApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post created!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create post');
    },
  });
}

export function useVotePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, value }: { postId: string; value: 1 | -1 }) =>
      postApi.vote(postId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to vote');
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postApi.delete(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    },
  });
}
