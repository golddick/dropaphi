// lib/stores/admin/admin.store.ts
import { create } from 'zustand';
import { AdminSubscriptionTransaction, AdminPromoCode, AdminStats, CreatePromoData } from '../type/trans';

interface AdminState {
  transactions: AdminSubscriptionTransaction[];
  promoCodes: AdminPromoCode[];
  stats: AdminStats | null;
  isLoading: boolean;
  error: string | null;

  fetchTransactions: (filters?: any) => Promise<void>;
  fetchPromoCodes: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createPromoCode: (data: CreatePromoData) => Promise<void>;
  updatePromoCode: (id: string, data: Partial<CreatePromoData>) => Promise<void>;
  deletePromoCode: (id: string) => Promise<void>;
  exportTransactions: (format: 'csv' | 'json') => Promise<void>;
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

export const useAdminStore = create<AdminState>()((set, get) => ({
  transactions: [],
  promoCodes: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchTransactions: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams({
        page: filters.page || '1',
        limit: filters.limit || '50',
        ...filters
      }).toString();
      
      const data = await apiFetch(`/api/admin/transactions?${queryParams}`);

      console.log('📊 Fetched transactions:', data);
      
      // Handle response structure
      const transactions = data.data?.transactions || data.transactions || [];
      const stats = data.data?.stats || data.stats || null;
      const totals = data.data?.totals || data.totals || null;
      
      set({ 
        transactions: Array.isArray(transactions) ? transactions : [], 
        stats: {
          totalTransactions: stats?.totalTransactions || transactions.length,
          totalRevenue: totals?.payments || 0,
          activeSubscriptions: stats?.activeSubscriptions || 0,
          mrr: stats?.mrr || 0,
          activePromoCodes: stats?.activePromoCodes || 0,
          totals: totals || {
            payments: 0,
            renewals: 0,
            upgrades: 0,
            refunds: 0,
            net: 0,
          },
        },
        isLoading: false 
      });
    } catch (error) {
      console.error('❌ Fetch transactions error:', error);
      set({ 
        transactions: [], 
        error: (error as Error).message, 
        isLoading: false 
      });
    }
  },

  fetchPromoCodes: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('📡 Fetching promo codes...');
      
      const response = await fetch('/api/admin/promo-codes', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      console.log('📦 Promo codes response:', result);
      
      if (!response.ok) {
        throw new Error(result.message || result.error || `HTTP error ${response.status}`);
      }
      
      let promoCodesArray: AdminPromoCode[] = [];
      
      if (result.data && Array.isArray(result.data)) {
        promoCodesArray = result.data;
      } else if (result.data?.data && Array.isArray(result.data.data)) {
        promoCodesArray = result.data.data;
      } else if (Array.isArray(result)) {
        promoCodesArray = result;
      }
      
      console.log(`📊 Loaded ${promoCodesArray.length} promo codes`);
      
      set({ 
        promoCodes: promoCodesArray, 
        isLoading: false 
      });
    } catch (error) {
      console.error('❌ Fetch promo codes error:', error);
      set({ 
        promoCodes: [], 
        error: (error as Error).message, 
        isLoading: false 
      });
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch('/api/admin/stats');
      
      set({ 
        stats: {
          totalTransactions: data.data?.totalTransactions || 0,
          totalRevenue: data.data?.totalRevenue || 0,
          activeSubscriptions: data.data?.activeSubscriptions || 0,
          mrr: data.data?.mrr || 0,
          activePromoCodes: data.data?.activePromoCodes || 0,
          totals: data.data?.revenueBreakdown || {
            payments: 0,
            renewals: 0,
            upgrades: 0,
            refunds: 0,
            net: 0,
          },
        }, 
        isLoading: false 
      });
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error);
      set({ isLoading: false });
    }
  },

  createPromoCode: async (data: CreatePromoData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiFetch('/api/admin/promo-codes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      await get().fetchPromoCodes();
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updatePromoCode: async (id: string, data: Partial<CreatePromoData>) => {
    set({ isLoading: true, error: null });
    try {
      await apiFetch(`/api/admin/promo-codes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      await get().fetchPromoCodes();
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deletePromoCode: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiFetch(`/api/admin/promo-codes/${id}`, {
        method: 'DELETE',
      });
      await get().fetchPromoCodes();
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  exportTransactions: async (format: 'csv' | 'json') => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/admin/transactions/export?format=${format}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscription-transactions-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));