import axiosClient from './axiosClient';
import type { ApiResponse, User, PostsResponse } from '../types';

export const userApi = {
  getProfile: (username: string) =>
    axiosClient.get<ApiResponse<User>>(`/users/${username}`),

  getPosts: (username: string, page = 1) =>
    axiosClient.get<ApiResponse<PostsResponse>>(`/users/${username}/posts`, {
      params: { page },
    }),

  updateProfile: (data: { displayName?: string; bio?: string }) =>
    axiosClient.put<ApiResponse<User>>('/users/profile', data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axiosClient.post<ApiResponse<{ avatarUrl: string }>>('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
