import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      authApi.login(payload),
    onSuccess: ({ data }) => {
      if (data.data) {
        setAuth(data.data.user, data.data.accessToken);
        toast.success('Welcome back!');
        navigate('/');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: { username: string; email: string; password: string; displayName?: string }) =>
      authApi.register(payload),
    onSuccess: ({ data }) => {
      if (data.data) {
        setAuth(data.data.user, data.data.accessToken);
        toast.success('Account created successfully!');
        navigate('/');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Logged out');
      navigate('/');
    },
    onError: () => {
      // Force logout even on error
      logout();
      queryClient.clear();
      navigate('/');
    },
  });
}
