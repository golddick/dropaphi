// lib/stores/notification.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  shortMessage?: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  priority: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: any;
  createdAt: string;
  readAt?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  preferences: any | null;
  
  // Actions
  fetchNotifications: (page?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archive: (id: string) => Promise<void>;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (prefs: any) => Promise<void>;
  addNotification: (notification: Notification) => void;
  clearError: () => void;
}

const apiFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || data.error || 'Request failed');
  return data;
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      preferences: null,

      fetchNotifications: async (page = 1) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch(`/api/user/notifications?page=${page}`);
          set({ 
            notifications: data.data.notifications,
            unreadCount: data.data.unreadCount,
            isLoading: false 
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      markAsRead: async (id: string) => {
        try {
          await apiFetch(`/api/user/notifications/${id}/read`, {
            method: 'POST',
          });
          
          set(state => ({
            notifications: state.notifications.map(n => 
              n.id === id ? { ...n, status: 'READ', readAt: new Date().toISOString() } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      markAllAsRead: async () => {
        try {
          await apiFetch('/api/user/notifications/read-all', {
            method: 'POST',
          });
          
          set(state => ({
            notifications: state.notifications.map(n => ({ ...n, status: 'READ' })),
            unreadCount: 0,
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      archive: async (id: string) => {
        try {
          await apiFetch(`/api/user/notifications/${id}/archive`, {
            method: 'POST',
          });
          
          set(state => ({
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: state.notifications.find(n => n.id === id)?.status === 'UNREAD' 
              ? state.unreadCount - 1 
              : state.unreadCount,
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      fetchPreferences: async () => {
        try {
          const data = await apiFetch('/api/user/notifications/preferences');
          set({ preferences: data.data.preferences });
        } catch (error) {
          console.error('Failed to fetch preferences:', error);
        }
      },

      updatePreferences: async (prefs: any) => {
        try {
          const data = await apiFetch('/api/user/notifications/preferences', {
            method: 'PATCH',
            body: JSON.stringify(prefs),
          });
          set({ preferences: data.data.preferences });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      addNotification: (notification: Notification) => {
        set(state => ({
          notifications: [notification, ...state.notifications],
          unreadCount: notification.status === 'UNREAD' ? state.unreadCount + 1 : state.unreadCount,
        }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);