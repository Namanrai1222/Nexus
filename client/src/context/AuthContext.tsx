 import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setAuth, logout: clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // On mount, verify token by fetching /me
  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await authApi.getMe();
        if (data.data) {
          useAuthStore.getState().setUser(data.data);
        }
      } catch {
        // Token expired or invalid — try refresh
        try {
          await authApi.refresh();
          const { data } = await authApi.getMe();
          if (data.data) {
            useAuthStore.getState().setUser(data.data);
          }
        } catch {
          clearAuth();
        }
      } finally {
        setIsLoading(false);
      }
    };
    verify();
  }, [clearAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    if (data.data) {
      setAuth(data.data.user, data.data.accessToken);
    }
  }, [setAuth]);

  const register = useCallback(async (
    username: string,
    email: string,
    password: string,
    displayName?: string
  ) => {
    const { data } = await authApi.register({ username, email, password, displayName });
    if (data.data) {
      setAuth(data.data.user, data.data.accessToken);
    }
  }, [setAuth]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
