import axiosClient from './axiosClient';
import type { ApiResponse, Comment } from '../types';

interface CreateCommentPayload {
  body: string;
  postId: string;
  parentId?: string;
}

export const commentApi = {
  getByPost: (postId: string) =>
    axiosClient.get<ApiResponse<Comment[]>>(`/comments/post/${postId}`),

  create: (payload: CreateCommentPayload) =>
    axiosClient.post<ApiResponse<Comment>>('/comments', payload),

  vote: (commentId: string, value: 1 | -1) =>
    axiosClient.post<ApiResponse<{ score: number }>>(`/comments/${commentId}/vote`, { value }),

  delete: (commentId: string) =>
    axiosClient.delete<ApiResponse<null>>(`/comments/${commentId}`),
};
