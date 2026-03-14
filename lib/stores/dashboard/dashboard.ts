    // import { create } from 'zustand';
    // import { devtools } from 'zustand/middleware';
    // import { useWorkspaceStore } from '../workspace';

    // export interface WorkspaceOverview {
    // workspace: {
    //     id: string;
    //     name: string;
    //     slug: string;
    //     plan: string;
    //     createdAt: string;
    //     role: string;
    // };
    // limits: {
    //     sms: number;
    //     email: number;
    //     otp: number;
    //     storage: number;
    //     subscribers: number;
    // };
    // usage: {
    //     sms: { used: number; limit: number; percentage: number };
    //     email: { used: number; limit: number; percentage: number };
    //     otp: { used: number; limit: number; percentage: number };
    //     storage: { used: number; limit: number; percentage: number };
    //     subscribers: { used: number; limit: number; percentage: number };
    // };
    // stats: {
    //     total: {
    //     sms: number;
    //     email: number;
    //     otp: number;
    //     files: number;
    //     storage: number;
    //     subscribers: number;
    //     apiKeys: number;
    //     };
    //     monthly: {
    //     sms: number;
    //     email: number;
    //     otp: number;
    //     };
    //     success: {
    //     sms: number;
    //     email: number;
    //     otp: number;
    //     };
    // };
    // recent: {
    //     sms: Array<{
    //     id: string;
    //     recipient: string;
    //     message: string;
    //     status: string;
    //     createdAt: string;
    //     }>;
    //     emails: Array<{
    //     id: string;
    //     subject: string;
    //     to: string;
    //     status: string;
    //     createdAt: string;
    //     }>;
    // };
    // subscription: {
    //     tier: string;
    //     status: string;
    //     currentPeriodEnd: string;
    //     monthlyPrice: number;
    // } | null;
    // }

    // export interface ChartDataPoint {
    // date: string;
    // sms: number;
    // email: number;
    // otp: number;
    // }

    // interface DashboardState {
    // overview: WorkspaceOverview | null;
    // chartData: ChartDataPoint[];
    // chartPeriod: '7d' | '30d' | '90d';
    // isLoading: {
    //     overview: boolean;
    //     charts: boolean;
    // };
    // error: string | null;
    
    // // Actions - now without workspaceId parameter
    // fetchOverview: () => Promise<void>;
    // fetchChartData: (period?: '7d' | '30d' | '90d') => Promise<void>;
    // setChartPeriod: (period: '7d' | '30d' | '90d') => void;
    // refreshDashboard: () => Promise<void>;
    // }

    // export const useDashboardStore = create<DashboardState>()(
    // devtools(
    //     (set, get) => {
    //     // Helper functions to update loading states
    //     const setLoading = (key: keyof DashboardState['isLoading'], value: boolean) => {
    //         set((state) => ({
    //         isLoading: {
    //             ...state.isLoading,
    //             [key]: value,
    //         },
    //         }));
    //     };

    //     // Helper to get current workspace ID from workspace store
    //     const getWorkspaceId = (): string | null => {
    //         const { currentWorkspace } = useWorkspaceStore.getState();
    //         return currentWorkspace?.id || null;
    //     };

    //     return {
    //         overview: null,
    //         chartData: [],
    //         chartPeriod: '30d',
    //         isLoading: {
    //         overview: false,
    //         charts: false,
    //         },
    //         error: null,

    //         fetchOverview: async () => {
    //         const workspaceId = getWorkspaceId();

    //         console.log(workspaceId, 'store')
            
    //         if (!workspaceId) {
    //             set({ error: 'No workspace selected' });
    //             return;
    //         }

    //         try {
    //             setLoading('overview', true);
    //             set({ error: null });
                
    //             const response = await fetch(`/api/workspace/${workspaceId}/overview`);
                
    //             if (!response.ok) {
    //             throw new Error('Failed to fetch dashboard overview');
    //             }

    //             const data = await response.json();
                
    //             set({ 
    //             overview: data.data,
    //             });
    //         } catch (error) {
    //             set({ 
    //             error: error instanceof Error ? error.message : 'Failed to fetch overview',
    //             });
    //         } finally {
    //             setLoading('overview', false);
    //         }
    //         },

    //         fetchChartData: async (period?: '7d' | '30d' | '90d') => {
    //         const workspaceId = getWorkspaceId();
            
    //         if (!workspaceId) {
    //             set({ error: 'No workspace selected' });
    //             return;
    //         }

    //         try {
    //             setLoading('charts', true);
    //             set({ error: null });
                
    //             const currentPeriod = period || get().chartPeriod;
    //             const response = await fetch(`/api/workspace/${workspaceId}/charts?period=${currentPeriod}`);
                
    //             if (!response.ok) {
    //             throw new Error('Failed to fetch chart data');
    //             }

    //             const data = await response.json();
                
    //             set({ 
    //             chartData: data.data.data,
    //             chartPeriod: currentPeriod,
    //             });
    //         } catch (error) {
    //             set({ 
    //             error: error instanceof Error ? error.message : 'Failed to fetch chart data',
    //             });
    //         } finally {
    //             setLoading('charts', false);
    //         }
    //         },

    //         setChartPeriod: (period) => {
    //         set({ chartPeriod: period });
            
    //         // Auto-fetch chart data when period changes
    //         const workspaceId = getWorkspaceId();
    //         if (workspaceId) {
    //             get().fetchChartData(period);
    //         }
    //         },

    //         refreshDashboard: async () => {
    //         const workspaceId = getWorkspaceId();
            
    //         if (!workspaceId) {
    //             set({ error: 'No workspace selected' });
    //             return;
    //         }

    //         await Promise.all([
    //             get().fetchOverview(),
    //             get().fetchChartData(),
    //         ]);
    //         },
    //     };
    //     },
    //     { name: 'dashboard-store' }
    // )
    // );






import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useWorkspaceStore } from '../workspace';

export interface WorkspaceOverview {
  workspace: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    createdAt: string;
    role: string;
  };
  limits: {
    sms: number;
    email: number;
    otp: number;
    storage: number;
    subscribers: number;
  };
  usage: {
    sms: { used: number; limit: number; percentage: number };
    email: { used: number; limit: number; percentage: number };
    otp: { used: number; limit: number; percentage: number };
    storage: { used: number; limit: number; percentage: number };
    subscribers: { used: number; limit: number; percentage: number };
  };
  stats: {
    total: {
      sms: number;
      email: number;
      otp: number;
      files: number;
      storage: number;
      subscribers: number;
      apiKeys: number;
    };
    monthly: {
      sms: number;
      email: number;
      otp: number;
    };
    success: {
      sms: number;
      email: number;
      otp: number;
    };
  };
  recent: {
    sms: Array<{
      id: string;
      recipient: string;
      message: string;
      status: string;
      createdAt: string;
    }>;
    emails: Array<{
      id: string;
      subject: string;
      to: string;
      status: string;
      createdAt: string;
    }>;
  };
  subscription: {
    tier: string;
    status: string;
    currentPeriodEnd: string;
    monthlyPrice: number;
  } | null;
}

export interface ChartDataPoint {
  date: string;
  sms: number;
  email: number;
  otp: number;
}

interface DashboardState {
  overview: WorkspaceOverview | null;
  chartData: ChartDataPoint[];
  chartPeriod: '7d' | '30d' | '90d';
  isLoading: {
    overview: boolean;
    charts: boolean;
  };
  error: string | null;
  
  // Actions
  fetchOverview: (workspaceId: string) => Promise<void>;
  fetchChartData: (workspaceId: string, period?: '7d' | '30d' | '90d') => Promise<void>;
  setChartPeriod: (period: '7d' | '30d' | '90d') => void;
  refreshDashboard: (workspaceId: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => {
      // Helper functions to update loading states
      const setLoading = (key: keyof DashboardState['isLoading'], value: boolean) => {
        set((state) => ({
          isLoading: {
            ...state.isLoading,
            [key]: value,
          },
        }));
      };

      return {
        overview: null,
        chartData: [],
        chartPeriod: '30d',
        isLoading: {
          overview: false,
          charts: false,
        },
        error: null,

        fetchOverview: async (workspaceId: string) => {
          try {
            setLoading('overview', true);
            set({ error: null });
            
            const response = await fetch(`/api/workspace/${workspaceId}/overview`);
            
            if (!response.ok) {
              throw new Error('Failed to fetch dashboard overview');
            }

            const data = await response.json();
            
            set({ 
              overview: data.data,
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch overview',
            });
          } finally {
            setLoading('overview', false);
          }
        },

        fetchChartData: async (workspaceId: string, period?: '7d' | '30d' | '90d') => {
             const { currentWorkspace } = useWorkspaceStore.getState()
             console.log(currentWorkspace?.id, ' das work')
          try {
            setLoading('charts', true);
            set({ error: null });
            
            const currentPeriod = period || get().chartPeriod;
            const response = await fetch(`/api/workspace/${workspaceId}/charts?period=${currentPeriod}`);
            
            if (!response.ok) {
              throw new Error('Failed to fetch chart data');
            }

            const data = await response.json();
            
            set({ 
              chartData: data.data.data,
              chartPeriod: currentPeriod,
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch chart data',
            });
          } finally {
            setLoading('charts', false);
          }
        },

        setChartPeriod: (period) => {
          set({ chartPeriod: period });
        },

        refreshDashboard: async (workspaceId: string) => {
              
          await Promise.all([
            get().fetchOverview(workspaceId|| ' '),
            get().fetchChartData(workspaceId|| ''),
          ]);
        },
      };
    },
    { name: 'dashboard-store' }
  )
);