// // lib/stores/invitation/store.ts
// import { create } from 'zustand';
// import { toast } from 'sonner';

// export interface Invitation {
//   id: string;
//   token: string;
//   invitedEmail: string;
//   workspaceId: string;
//   workspaceName: string;
//   workspaceSlug: string;
//   role: string;
//   inviterName: string;
//   inviterEmail?: string;
//   expiresAt: string;
//   isExpired: boolean;
// }

// interface InvitationState {
//   // State
//   currentInvitation: Invitation | null;
//   isLoading: boolean;
//   error: string | null;
  
//   // Actions
//   fetchInvitation: (code: string) => Promise<Invitation | null>;
//   acceptInvitation: (code: string) => Promise<any>;
//   clearInvitation: () => void;
//   clearError: () => void;
// }

// // Custom fetch with error handling
// const apiFetch = async (url: string, options: RequestInit = {}) => {
//   const response = await fetch(url, {
//     ...options,
//     credentials: 'include',
//     headers: {
//       'Content-Type': 'application/json',
//       ...options.headers,
//     },
//   });

//   const data = await response.json().catch(() => ({}));

//   if (!response.ok) {
//     // Handle 401 with requiresAuth flag
//     if (response.status === 401 && data.requiresAuth) {
//       return { requiresAuth: true, invitation: data.invitation };
//     }
//     throw new Error(data.error || data.message || 'Request failed');
//   }

//   return data;
// };

// export const useInvitationStore = create<InvitationState>((set, get) => ({
//   // Initial state
//   currentInvitation: null,
//   isLoading: false,
//   error: null,

//   fetchInvitation: async (code: string) => {
//     if (!code) {
//       set({ error: 'Invalid invitation token' });
//       return null;
//     }

//     set({ isLoading: true, error: null });

//     try {
//       const data = await apiFetch(`/api/invite/${code}`);

//       console.log(data, 'inv store')

//       if (data.success && data.data) {
//         set({ 
//           currentInvitation: data.data,
//           isLoading: false 
//         });
//         return data.data;
//       }
      
//       throw new Error('Invalid response from server');
//     } catch (error) {
//       console.error('❌ Fetch invitation error:', error);
//       const errorMessage = (error as Error).message;
//       set({ error: errorMessage, isLoading: false });
//       toast.error(errorMessage);
//       return null;
//     }
//   },

//   acceptInvitation: async (code: string) => {
//     if (!code) {
//       set({ error: 'Invalid invitation token' });
//       throw new Error('Invalid invitation token');
//     }

//     set({ isLoading: true, error: null });

//     try {
//       const data = await apiFetch(`/api/invite/${code}/accept`, {
//         method: 'POST',
//       });

//       // Handle case where authentication is required
//       if (data.requiresAuth) {
//         // Store invitation for after login
//         localStorage.setItem('pendingInvitation', JSON.stringify({
//           code,
//           ...data.invitation
//         }));
//         set({ isLoading: false });
//         return { requiresAuth: true, ...data };
//       }

//       if (data.success && data.data) {
//         set({ isLoading: false });
//         toast.success('Successfully joined workspace!');
//         return data.data;
//       }
      
//       throw new Error(data.error || 'Failed to accept invitation');
//     } catch (error) {
//       console.error('❌ Accept invitation error:', error);
//       const errorMessage = (error as Error).message;
//       set({ error: errorMessage, isLoading: false });
//       toast.error(errorMessage);
//       throw error;
//     }
//   },

//   clearInvitation: () => {
//     set({ currentInvitation: null });
//   },

//   clearError: () => {
//     set({ error: null });
//   },
// }));








// lib/stores/invitation/store.ts
import { create } from 'zustand';
import { toast } from 'sonner';

export interface Invitation {
  id: string;
  token: string;
  invitedEmail: string;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  role: string;
  inviterName: string;
  inviterEmail?: string;
  expiresAt: string;
  isExpired: boolean;
}

interface InvitationState {
  // State
  currentInvitation: Invitation | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchInvitation: (token: string) => Promise<Invitation | null>;
  acceptInvitation: (token: string) => Promise<any>;
  clearInvitation: () => void;
  clearError: () => void;
}

// Custom fetch with error handling
const apiFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Handle 401 with requiresAuth flag
    if (response.status === 401 && data.requiresAuth) {
      return { requiresAuth: true, invitation: data.invitation };
    }
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
};

export const useInvitationStore = create<InvitationState>((set, get) => ({
  // Initial state
  currentInvitation: null,
  isLoading: false,
  error: null,

  fetchInvitation: async (token: string) => {
    if (!token) {
      set({ error: 'Invalid invitation token' });
      return null;
    }

    set({ isLoading: true, error: null });

    try {
      const data = await apiFetch(`/api/invite/${token}`);

      if (data.success && data.data) {
        set({ 
          currentInvitation: data.data,
          isLoading: false 
        });
        return data.data;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('❌ Fetch invitation error:', error);
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  acceptInvitation: async (token: string) => {
    if (!token) {
      set({ error: 'Invalid invitation token' });
      throw new Error('Invalid invitation token');
    }

    set({ isLoading: true, error: null });

    try {
      const data = await apiFetch(`/api/invite/${token}/accept`, {
        method: 'POST',
      });

      // Handle case where authentication is required
      if (data.requiresAuth) {
        // Store invitation for after login
        localStorage.setItem('pendingInvitation', JSON.stringify({
          token,
          ...data.invitation
        }));
        set({ isLoading: false });
        return { requiresAuth: true, ...data };
      }

      if (data.success && data.data) {
        set({ isLoading: false });
        toast.success('Successfully joined workspace!');
        return data.data;
      }
      
      throw new Error(data.error || 'Failed to accept invitation');
    } catch (error) {
      console.error('❌ Accept invitation error:', error);
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  clearInvitation: () => {
    set({ currentInvitation: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));