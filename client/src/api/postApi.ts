import axiosClient from './axiosClient';
import type { ApiResponse, Post, PostsResponse } from '../types';

interface CreatePostPayload {
  title: string;
  body: string;
  type?: 'TEXT' | 'IMAGE' | 'LINK';
  communityId: string;
  tags?: string[];
  linkUrl?: string;
}

interface GetPostsParams {
  page?: number;
  limit?: number;
  sort?: 'hot' | 'new' | 'top';
  community?: string;
  tag?: string;
  search?: string;
}

export const postApi = {
  getAll: (params?: GetPostsParams) =>
    axiosClient.get<ApiResponse<PostsResponse>>('/posts', { params }),

  getBySlug: (slug: string) =>
    axiosClient.get<ApiResponse<Post>>(`/posts/${slug}`),

  create: (data: FormData) =>
    axiosClient.post<ApiResponse<Post>>('/posts', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  createJson: (data: CreatePostPayload) =>
    axiosClient.post<ApiResponse<Post>>('/posts', data),

  update: (postId: string, data: { title?: string; body?: string }) =>
    axiosClient.put<ApiResponse<Post>>(`/posts/${postId}`, data),

  delete: (postId: string) =>
    axiosClient.delete<ApiResponse<null>>(`/posts/${postId}`),

  vote: (postId: string, value: 1 | -1) =>
    axiosClient.post<ApiResponse<{ score: number }>>(`/posts/${postId}/vote`, { value }),
};
