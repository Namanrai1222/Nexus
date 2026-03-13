import { Bell } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../../api/communityApi';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import { formatDate } from '../../utils/formatDate';
import { cn } from '../../utils/cn';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { unreadCount, notifications, setNotifications, markAllAsRead } = useNotificationStore();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await notificationApi.getAll();
      return data.data;
    },
    enabled: !!user,
    refetchInterval: 30000, // Poll every 30s
  });

  useEffect(() => {
    if (data) {
      setNotifications(data.notifications, data.unreadCount);
    }
  }, [data, setNotifications]);

  // Mark all read
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative h-9 w-9 flex items-center justify-center rounded-lg hover:bg-bg3 transition-colors text-subtext hover:text-text"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red text-[10px] text-white flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs text-purple hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-subtext">
              No notifications yet
            </div>
          ) : (
            <div>
              {notifications.map((n) => (
                <a
                  key={n.id}
                  href={n.link || '#'}
                  className={cn(
                    'block px-4 py-3 border-b border-border last:border-0 hover:bg-bg3 transition-colors',
                    !n.isRead && 'bg-purple/5'
                  )}
                  onClick={() => setOpen(false)}
                >
                  <p className="text-sm text-text">{n.message}</p>
                  <p className="text-xs text-subtext mt-1">{formatDate(n.createdAt)}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
