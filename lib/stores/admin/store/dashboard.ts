import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    new: number;
    growth: number;
  };
  workspaces: {
    total: number;
    active: number;
    new: number;
    byTier: Array<{ tier: string; count: number }>;
  };
  revenue: {
    total: number;
    thisPeriod: number;
    refunds: number;
    net: number;
  };
  transactions: {
    pending: number;
    failed: number;
  };
  api: {
    totalCalls: number;
    thisPeriod: number;
  };
  communications: {
    emails: {
      total: number;
      thisPeriod: number;
    };
    sms: {
      total: number;
      thisPeriod: number;
    };
  };
}

export interface ChartDataPoint {
  date: string;
  count?: number;
  amount?: number;
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  status: string;
  joinedAt: string;
  avatarUrl: string | null;
  workspace: string;
}

export interface RecentTransaction {
  id: string;
  workspaceName: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface TopWorkspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  emailsSent: number;
  smsSent: number;
  subscribers: number;
  owner: string;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

interface DashboardState {
  stats: DashboardStats | null;
  charts: {
    userGrowth: ChartDataPoint[];
    revenue: ChartDataPoint[];
  };
  recentUsers: RecentUser[];
  recentTransactions: RecentTransaction[];
  topWorkspaces: TopWorkspace[];
  alerts: SystemAlert[];
  isLoading: boolean;
  error: string | null;
  period: '7d' | '30d' | '90d' | '1y';
  lastUpdated: string | null;
  
  // Actions
  fetchDashboardData: (period?: '7d' | '30d' | '90d' | '1y') => Promise<void>;
  setPeriod: (period: '7d' | '30d' | '90d' | '1y') => void;
  refreshData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      stats: null,
      charts: {
        userGrowth: [],
        revenue: [],
      },
      recentUsers: [],
      recentTransactions: [],
      topWorkspaces: [],
      alerts: [],
      isLoading: false,
      error: null,
      period: '30d',
      lastUpdated: null,

      fetchDashboardData: async (period?: '7d' | '30d' | '90d' | '1y') => {
        try {
          set({ isLoading: true, error: null });
          
          const currentPeriod = period || get().period;
          const response = await fetch(`/api/admin/dashboard?period=${currentPeriod}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
          }

          const data = await response.json();
          
          set({
            stats: data.data.stats,
            charts: data.data.charts,
            recentUsers: data.data.recentUsers,
            recentTransactions: data.data.recentTransactions,
            topWorkspaces: data.data.topWorkspaces,
            alerts: data.data.alerts,
            lastUpdated: data.data.timestamp,
            period: currentPeriod,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
            isLoading: false 
          });
        }
      },

      setPeriod: (period) => {
        set({ period });
        get().fetchDashboardData(period);
      },

      refreshData: async () => {
        await get().fetchDashboardData(get().period);
      },
    }),
    { name: 'admin-dashboard-store' }
  )
);