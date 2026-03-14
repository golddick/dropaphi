// // lib/stores/api-keys.store.ts
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import { useWorkspaceStore } from './workspace';
// import { toast } from 'sonner';
// import { ApiKey, ApiKeyStats, CreateApiKeyData, UpdateApiKeyData } from './types';

// // Custom fetch for API key calls

// const apiFetch = async (url: string, options: RequestInit = {}) => {
//     console.log(`API Fetch: ${options.method || 'GET'} ${url}`, options.body ? `Body: ${options.body}` : '');
//   const response = await fetch(url, {
//     ...options,
//     credentials: 'include',
//     headers: {
//       'Content-Type': 'application/json',
//       ...options.headers,
//     },
//   });

//   if (!response.ok) {
//     // Don't redirect on 401 - let the auth store handle it
//     if (response.status === 401) {
//       throw new Error('unauthorized');
//     }
//     const data = await response.json().catch(() => ({}));
//      console.log(`API Fetch : data`, data);
//     throw new Error(data.message || data.error || 'Request failed');
//   }

//   return response.json();
// };


// interface ApiKeyState {
//   // State
//   apiKeys: ApiKey[];
//   stats: ApiKeyStats | null;
//   isLoading: boolean;
//   isCreating: boolean;
//   error: string | null;
  
//   // Actions
//   fetchApiKeys: () => Promise<void>;
//   createApiKey: (data: CreateApiKeyData, workspaceId: string) => Promise<ApiKey | null>;
//   updateApiKey: (keyId: string, data: UpdateApiKeyData) => Promise<ApiKey | null>;
//   revokeApiKey: (keyId: string) => Promise<void>;
//   deleteApiKey: (keyId: string) => Promise<void>;
//   fetchStats: () => Promise<void>;
//   clearError: () => void;
// }

// export const useApiKeyStore = create<ApiKeyState>()(
//   persist(
//     (set, get) => ({
//       apiKeys: [],
//       stats: null,
//       isLoading: false,
//       isCreating: false, 
//       error: null,


//        fetchApiKeys: async () => {
//         const { currentWorkspace } = useWorkspaceStore.getState();
//         if (!currentWorkspace?.id) return;

//         try {
//           const data = await apiFetch(`/api/workspace/${currentWorkspace.id}/api-keys`);
          
//           if (data.data?.apiKeys) {
//             set({ apiKeys: data.data.apiKeys });
//           }
//         } catch (error) {
//           console.error('❌ Fetch API keys error:', error);
//         }
//       },

//       createApiKey: async (data: CreateApiKeyData, workspaceId: string) => {

//         console.log('worksopce:', workspaceId);
//         if (!workspaceId) {
//           throw new Error('No workspace selected');
//         }

//         set({ isCreating: true, error: null });
        
//         try {
//           const response = await apiFetch(`/api/workspace/${workspaceId}/api-keys`, {
//             method: 'POST',
//             body: JSON.stringify(data),
//           });

//           if (response.data?.apiKey) {
//             const newKey = response.data.apiKey;
            
//             // Add to list and show the key (only shown once)
//             set((state) => ({
//               apiKeys: [...state.apiKeys, { ...newKey, key: newKey.key }],
//               isCreating: false,
//             }));
            
//             // Show success toast with key copy option
//             toast.success('API Key created successfully!', {
//               duration: 10000,
//               description: 'Make sure to copy your key now. You won\'t be able to see it again.',
//               action: {
//                 label: 'Copy',
//                 onClick: () => {
//                   navigator.clipboard.writeText(newKey.key);
//                   toast.success('Key copied to clipboard!');
//                 }
//               }
//             });
            
//             return newKey;
//           }
          
//           return null;
//         } catch (error) {
//           console.error('❌ Create API key error:', error);
//           set({ error: (error as Error).message, isCreating: false });
//           throw error;
//         }
//       },

//       updateApiKey: async (keyId: string, data: UpdateApiKeyData) => {
//         const { currentWorkspace } = useWorkspaceStore.getState();
//         if (!currentWorkspace?.id) {
//           throw new Error('No workspace selected');
//         }

//         set({ isLoading: true, error: null });
        
//         try {
//           const response = await apiFetch(`/api/workspace/${currentWorkspace.id}/api-keys/${keyId}`, {
//             method: 'PATCH',
//             body: JSON.stringify(data),
//           });

//           if (response.data?.apiKey) {
//             const updatedKey = response.data.apiKey;
            
//             set((state) => ({
//               apiKeys: state.apiKeys.map((key) => 
//                 key.id === keyId ? { ...key, ...updatedKey } : key
//               ),
//               isLoading: false,
//             }));
            
//             toast.success('API Key updated successfully');
//             return updatedKey;
//           }
          
//           return null;
//         } catch (error) {
//           console.error('❌ Update API key error:', error);
//           set({ error: (error as Error).message, isLoading: false });
//           throw error;
//         }
//       },

//       revokeApiKey: async (keyId: string) => {
//         const { currentWorkspace } = useWorkspaceStore.getState();
//         if (!currentWorkspace?.id) {
//           throw new Error('No workspace selected');
//         }

//         set({ isLoading: true, error: null });
        
//         try {
//           await apiFetch(`/api/workspace/${currentWorkspace.id}/api-keys/${keyId}/revoke`, {
//             method: 'POST',
//           });

//           set((state) => ({
//             apiKeys: state.apiKeys.map((key) =>
//               key.id === keyId ? ({ ...key, status: 'REVOKED' } as ApiKey) : key
//             ),
//             isLoading: false,
//           }));
          
//           toast.success('API Key revoked successfully');
//         } catch (error) {
//           console.error('❌ Revoke API key error:', error);
//           set({ error: (error as Error).message, isLoading: false });
//           throw error;
//         }
//       },

//       deleteApiKey: async (keyId: string) => {
//         const { currentWorkspace } = useWorkspaceStore.getState();
//         if (!currentWorkspace?.id) {
//           throw new Error('No workspace selected');
//         }

//         if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
//           return;
//         }

//         set({ isLoading: true, error: null });
        
//         try {
//           await apiFetch(`/api/workspace/${currentWorkspace.id}/api-keys/${keyId}`, {
//             method: 'DELETE',
//           });

//           set((state) => ({
//             apiKeys: state.apiKeys.filter((key) => key.id !== keyId),
//             isLoading: false,
//           }));
          
//           toast.success('API Key deleted successfully');
//         } catch (error) {
//           console.error('❌ Delete API key error:', error);
//           set({ error: (error as Error).message, isLoading: false });
//           throw error;
//         }
//       },

//       fetchStats: async () => {
//         const { currentWorkspace } = useWorkspaceStore.getState();
//         if (!currentWorkspace?.id) return;

//         try {
//           const data = await apiFetch(`/api/workspace/${currentWorkspace.id}/api-keys/stats`);
          
//           if (data.data?.stats) {
//             set({ stats: data.data.stats });
//           }
//         } catch (error) {
//           console.error('❌ Fetch stats error:', error);
//         }
//       },

//       clearError: () => set({ error: null }),
//     }),
//     {
//       name: 'api-keys-storage',
//       partialize: (state) => ({ 
//         // Only persist non-sensitive data
//       }),
//     }
//   )
// );










import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useWorkspaceStore } from './workspace';
import { toast } from 'sonner';

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastFourChars: string;
  maskedKey: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  isTest: boolean;
  permissions?: any;
  rateLimitPerMin: number;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  // The raw key is only present when first created
  key?: string;
}

export interface ApiKeyStats {
  totalKeys: number;
  activeKeys: number;
  liveKeys: number;
  testKeys: number;
  totalCalls: number;
  averageCallsPerDay: number;
}

export interface CreateApiKeyData {
  name: string;
  environment: 'live' | 'test';
  expiresIn?: number;
  permissions?: any;
  rateLimit?: number;
}

export interface UpdateApiKeyData {
  name?: string;
  permissions?: any;
  rateLimit?: number;
}

// Custom fetch for API key calls
const apiFetch = async (url: string, options: RequestInit = {}) => {
  console.log(`API Fetch: ${options.method || 'GET'} ${url}`, options.body ? `Body: ${options.body}` : '');
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    // Don't redirect on 401 - let the auth store handle it
    if (response.status === 401) {
      throw new Error('unauthorized');
    }
    const data = await response.json().catch(() => ({}));
    console.log(`API Fetch error:`, data);
    throw new Error(data.error || data.message || 'Request failed');
  }

  const data = await response.json();
  console.log(`API Fetch response:`, data);
  return data;
};

interface ApiKeyState {
  // State
  apiKeys: ApiKey[];
  stats: ApiKeyStats | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  
  // Actions
  fetchApiKeys: () => Promise<void>;
  createApiKey: (data: CreateApiKeyData, workspaceId: string) => Promise<ApiKey | null>;
  updateApiKey: (keyId: string, data: UpdateApiKeyData) => Promise<ApiKey | null>;
  revokeApiKey: (keyId: string) => Promise<void>;
  deleteApiKey: (keyId: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  clearError: () => void;
}

export const useApiKeyStore = create<ApiKeyState>()(
  persist(
    (set, get) => ({
      apiKeys: [],
      stats: null,
      isLoading: false,
      isCreating: false, 
      error: null,

      fetchApiKeys: async () => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          console.log('No workspace ID available');
          return;
        }

        set({ isLoading: true, error: null });
        
        try {
          const response = await apiFetch(`/api/workspace/${currentWorkspace.id}/api-keys`);
          
          if (response.data?.apiKeys) {
            console.log('Fetched API keys:', response.data.apiKeys);
            set({ apiKeys: response.data.apiKeys });
          }
        } catch (error) {
          console.error('❌ Fetch API keys error:', error);
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      createApiKey: async (data: CreateApiKeyData, workspaceId: string) => {
        console.log('Creating API key for workspace:', workspaceId, 'with data:', data);
        
        if (!workspaceId) {
          throw new Error('No workspace selected');
        }

        set({ isCreating: true, error: null });
        
        try {
          const response = await apiFetch(`/api/workspace/${workspaceId}/api-keys`, {
            method: 'POST',
            body: JSON.stringify({
              name: data.name,
              environment: data.environment,
              expiresIn: data.expiresIn,
              permissions: data.permissions,
              rateLimit: data.rateLimit,
            }),
          });

          console.log('Create API key response:', response);

          if (response.data?.apiKey) {
            const newKey = response.data.apiKey;
            
            // Add to list with the raw key (only available now)
            set((state) => ({
              apiKeys: [newKey, ...state.apiKeys],
              isCreating: false,
            }));
            
            // Show success toast with key copy option
            toast.success('API Key created successfully!', {
              duration: 10000,
              description: 'Make sure to copy your key now. You won\'t be able to see it again.',
              action: {
                label: 'Copy',
                onClick: () => {
                  navigator.clipboard.writeText(newKey.key);
                  toast.success('Key copied to clipboard!');
                }
              }
            });
            
            return newKey;
          }
          
          throw new Error('Invalid response from server');
        } catch (error) {
          console.error('❌ Create API key error:', error);
          set({ error: (error as Error).message, isCreating: false });
          throw error;
        }
      },

      updateApiKey: async (keyId: string, data: UpdateApiKeyData) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          throw new Error('No workspace selected');
        }

        set({ isLoading: true, error: null });
        
        try {
          const response = await apiFetch(`/api/workspace/${currentWorkspace.id}/api-keys/${keyId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          });

          if (response.data?.apiKey) {
            const updatedKey = response.data.apiKey;
            
            set((state) => ({
              apiKeys: state.apiKeys.map((key) => 
                key.id === keyId ? { ...key, ...updatedKey } : key
              ),
              isLoading: false,
            }));
            
            toast.success('API Key updated successfully');
            return updatedKey;
          }
          
          return null;
        } catch (error) {
          console.error('❌ Update API key error:', error);
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      revokeApiKey: async (keyId: string) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          throw new Error('No workspace selected');
        }

        set({ isLoading: true, error: null });
        
        try {
          await apiFetch(`/api/workspace/${currentWorkspace.id}/api-keys/${keyId}/revoke`, {
            method: 'POST',
          });

          set((state) => ({
            apiKeys: state.apiKeys.map((key) =>
              key.id === keyId ? { ...key, status: 'REVOKED' } : key
            ),
            isLoading: false,
          }));
          
          toast.success('API Key revoked successfully');
        } catch (error) {
          console.error('❌ Revoke API key error:', error);
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      deleteApiKey: async (keyId: string) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          throw new Error('No workspace selected');
        }

        if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
          return;
        }

        set({ isLoading: true, error: null });
        
        try {
          await apiFetch(`/api/workspace/${currentWorkspace.id}/api-keys/${keyId}`, {
            method: 'DELETE',
          });

          set((state) => ({
            apiKeys: state.apiKeys.filter((key) => key.id !== keyId),
            isLoading: false,
          }));
          
          toast.success('API Key deleted successfully');
        } catch (error) {
          console.error('❌ Delete API key error:', error);
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      fetchStats: async () => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) return;

        try {
          const response = await apiFetch(`/api/workspace/${currentWorkspace.id}/api-keys/stats`);
          
          if (response.data?.stats) {
            set({ stats: response.data.stats });
          }
        } catch (error) {
          console.error('❌ Fetch stats error:', error);
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'api-keys-storage',
      partialize: (state) => ({ 
        // Only persist non-sensitive data
        apiKeys: state.apiKeys.map(({ key, ...rest }) => rest), // Remove raw key from persisted state
        stats: state.stats,
      }),
    }
  )
);