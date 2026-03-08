import { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import type { Notification } from '../types';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const { accessToken } = useAuthStore();
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (accessToken) {
      const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('[Socket] Connected');
      });

      socket.on('notification', (data: Notification) => {
        addNotification(data);
      });

      socket.on('connect_error', (err) => {
        console.error('[Socket] Connection error:', err.message);
      });

      socketRef.current = socket;

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    } else {
      // Not authenticated — disconnect if connected
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }
  }, [accessToken, addNotification]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
