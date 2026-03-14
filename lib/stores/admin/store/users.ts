import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User } from '../type/user';



interface UsersStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  recentActive: number;
}

interface BreakdownItem {
  role?: string;
  status?: string;
  count: number;
}

interface UsersState {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  stats: UsersStats | null;
  breakdown: {
    byRole: BreakdownItem[];
    byStatus: BreakdownItem[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    search: string;
    status: string;
  };
  
  // Actions
  fetchUsers: (page?: number) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  setFilters: (filters: Partial<UsersState['filters']>) => void;
  updateUserStatus: (userId: string, status: User['status']) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  sendEmail: (userId: string, subject: string, body: string) => Promise<void>;
  sendSMS: (userId: string, message: string) => Promise<void>;
}

export const useUsersStore = create<UsersState>()(
  devtools(
    (set, get) => ({
      users: [],
      selectedUser: null,
      isLoading: false,
      error: null,
      stats: null,
      breakdown: {
        byRole: [],
        byStatus: [],
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
      filters: {
        search: '',
        status: 'all',
      },

      fetchUsers: async (page = 1) => {
        try {
          set({ isLoading: true, error: null });
          
          const { filters } = get();
          const params = new URLSearchParams({
            page: page.toString(),
            limit: '20',
            ...(filters.search && { search: filters.search }),
            ...(filters.status !== 'all' && { status: filters.status }),
          });

          const response = await fetch(`/api/admin/users?${params}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch users');
          }

          const data = await response.json();
          
          set({
            users: data.data.users,
            stats: data.data.stats,
            breakdown: data.data.breakdown,
            pagination: data.data.pagination,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch users', 
            isLoading: false 
          });
        }
      },

      setSelectedUser: (user) => {
        set({ selectedUser: user });
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
        // Reset to page 1 when filters change
        get().fetchUsers(1);
      },

      updateUserStatus: async (userId, status) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/admin/users/${userId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
          });

          if (!response.ok) {
            throw new Error('Failed to update user status');
          }

          // Refresh the users list
          await get().fetchUsers(get().pagination.page);
          set({ selectedUser: null });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update user status',
            isLoading: false 
          });
        }
      },

      deleteUser: async (userId) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete user');
          }

          // Refresh the users list
          await get().fetchUsers(get().pagination.page);
          set({ selectedUser: null });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete user',
            isLoading: false 
          });
        }
      },

      sendEmail: async (userId, subject, body) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/admin/users/${userId}/email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subject, body }),
          });

          if (!response.ok) {
            throw new Error('Failed to send email');
          }

          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to send email',
            isLoading: false 
          });
        }
      },

      sendSMS: async (userId, message) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`/api/admin/users/${userId}/sms`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
          });

          if (!response.ok) {
            throw new Error('Failed to send SMS');
          }

          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to send SMS',
            isLoading: false 
          });
        }
      },
    }),
    { name: 'admin-users-store' }
  )
);