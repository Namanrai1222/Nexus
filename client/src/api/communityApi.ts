import axiosClient from './axiosClient';
import type { ApiResponse, Community, NotificationsResponse } from '../types';

export const communityApi = {
  getAll: (params?: { page?: number; search?: string }) =>
    axiosClient.get<ApiResponse<{ communities: Community[]; total: number }>>('/communities', { params }),

  getBySlug: (slug: string) =>
    axiosClient.get<ApiResponse<Community>>(`/communities/${slug}`),

  create: (data: { name: string; description?: string; type?: string; isPrivate?: boolean }) =>
    axiosClient.post<ApiResponse<Community>>('/communities', data),

  update: (slug: string, data: { description?: string; iconUrl?: string; bannerUrl?: string }) =>
    axiosClient.put<ApiResponse<Community>>(`/communities/${slug}`, data),

  join: (slug: string) =>
    axiosClient.post<ApiResponse<null>>(`/communities/${slug}/join`),

  leave: (slug: string) =>
    axiosClient.post<ApiResponse<null>>(`/communities/${slug}/leave`),
};

export const notificationApi = {
  getAll: (page = 1) =>
    axiosClient.get<ApiResponse<NotificationsResponse>>('/notifications', { params: { page } }),

  markAsRead: (id: string) =>
    axiosClient.put<ApiResponse<null>>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    axiosClient.put<ApiResponse<null>>('/notifications/read-all'),
};
