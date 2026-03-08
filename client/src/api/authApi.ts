import axiosClient from './axiosClient';
import type { ApiResponse, User } from '../types';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

interface AuthData {
  user: User;
  accessToken: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    axiosClient.post<ApiResponse<AuthData>>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    axiosClient.post<ApiResponse<AuthData>>('/auth/login', payload),

  refresh: () =>
    axiosClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh'),

  logout: () =>
    axiosClient.post<ApiResponse<null>>('/auth/logout'),

  logoutAll: () =>
    axiosClient.post<ApiResponse<null>>('/auth/logout-all'),

  getMe: () =>
    axiosClient.get<ApiResponse<User>>('/auth/me'),
};
