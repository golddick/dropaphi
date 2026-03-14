// lib/stores/workspace.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './auth';
import { CreateWorkspaceData, Invitation, InviteMemberData, UpdateWorkspaceData, Workspace, WorkspaceDetails, WorkspaceMember } from './types';

// Custom fetch for workspace API calls
const workspaceFetch = async (url: string, options: RequestInit = {}) => {
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
    throw new Error(data.message || data.error || 'Request failed');
  }

  return response.json();
};

interface WorkspaceState {
  // State
  workspaces: Workspace[];
  currentWorkspace: WorkspaceDetails | null;
  invitations: Invitation[];
  pendingInvitations: Invitation[];
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  
  // Workspace Actions
  fetchWorkspaces: () => Promise<Workspace[]>;
  fetchWorkspaceById: (workspaceId: string) => Promise<WorkspaceDetails | null>;
  createWorkspace: (data: CreateWorkspaceData) => Promise<Workspace | null>;
  updateWorkspace: (workspaceId: string, data: UpdateWorkspaceData) => Promise<Workspace | null>;
  deleteWorkspace: (workspaceId: string) => Promise<boolean>;
  setCurrentWorkspace: (workspace: WorkspaceDetails | null) => void;
  setCurrentWorkspaceById: (workspaceId: string) => Workspace | null;
  
  // Member Actions
  fetchWorkspaceMembers: (workspaceId: string) => Promise<WorkspaceMember[]>;
  updateMemberRole: (workspaceId: string, memberId: string, role: string) => Promise<void>;
  removeMember: (workspaceId: string, memberId: string) => Promise<void>;
  
  // Invitation Actions
  fetchInvitations: (workspaceId?: string) => Promise<Invitation[]>;
  sendInvitations: (workspaceId: string, invitations: InviteMemberData[]) => Promise<any>;
  acceptInvitation: (code: string) => Promise<any>;
  declineInvitation: (invitationId: string) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  fetchPendingInvitations: () => Promise<Invitation[]>;
  
  // Utility
  clearError: () => void;
  clearWorkspaces: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      currentWorkspace: null,
      invitations: [],
      pendingInvitations: [],
      isLoading: false,
      isUpdating: false,
      error: null,

      fetchWorkspaces: async () => {
        // Don't fetch if not authenticated
        const { user } = useAuthStore.getState();
        if (!user) return [];

        set({ isLoading: true, error: null });
        try {
          const data = await workspaceFetch('/api/user/workspaces');
          
          if (data.data?.workspaces) {
            const workspaces = data.data.workspaces;
            set({ workspaces, isLoading: false });
            
          if (!get().currentWorkspace && workspaces.length > 0) {
            set({ currentWorkspace: workspaces[0] as WorkspaceDetails });
          }
        
            return workspaces;
          }
          return [];
        } catch (error) {
          // Don't set error for unauthorized - just return empty array
          if ((error as Error).message === 'unauthorized') {
            set({ isLoading: false });
            return [];
          }
          set({ error: (error as Error).message, isLoading: false });
          return [];
        }
      },

      // In your workspace store, update the fetchWorkspaceById to handle limits
      fetchWorkspaceById: async (workspaceId: string) => {
        const { user } = useAuthStore.getState();
        if (!user) return null;

        set({ isLoading: true, error: null });
        try {
          const data = await workspaceFetch(`/api/workspace/${workspaceId}`);
          
          if (data.data?.workspace) {
            const workspace = data.data.workspace;
            
            // Calculate usage percentages and remaining
            const limits = {
              subscribers: {
                limit: workspace.subscriberLimit || 0,
                used: workspace.currentSubscribers || 0,
                remaining: (workspace.subscriberLimit || 0) - (workspace.currentSubscribers || 0),
                percentage: workspace.subscriberLimit > 0 
                  ? Math.min(Math.round((workspace.currentSubscribers / workspace.subscriberLimit) * 100), 100)
                  : 0,
              },
              emails: {
                limit: workspace.emailLimit || 0,
                used: workspace.currentEmailsSent || 0,
                remaining: (workspace.emailLimit || 0) - (workspace.currentEmailsSent || 0),
                percentage: workspace.emailLimit > 0 
                  ? Math.min(Math.round((workspace.currentEmailsSent / workspace.emailLimit) * 100), 100)
                  : 0,
              },
              files: {
                limit: workspace.fileLimit || 0,
                used: workspace.currentFilesUsed || 0,
                remaining: (workspace.fileLimit || 0) - (workspace.currentFilesUsed || 0),
                percentage: workspace.fileLimit > 0 
                  ? Math.min(Math.round((workspace.currentFilesUsed / workspace.fileLimit) * 100), 100)
                  : 0,
              },
              sms: {
                limit: workspace.smsLimit || 0,
                used: workspace.currentSmsSent || 0,
                remaining: (workspace.smsLimit || 0) - (workspace.currentSmsSent || 0),
                percentage: workspace.smsLimit > 0 
                  ? Math.min(Math.round((workspace.currentSmsSent / workspace.smsLimit) * 100), 100)
                  : 0,
              },
              otp: {
                limit: workspace.otpLimit || 0,
                used: workspace.currentOtpSent || 0,
                remaining: (workspace.otpLimit || 0) - (workspace.currentOtpSent || 0),
                percentage: workspace.otpLimit > 0 
                  ? Math.min(Math.round((workspace.currentOtpSent / workspace.otpLimit) * 100), 100)
                  : 0,
              },
            };

            const formattedWorkspace = {
              ...workspace,
              logo: workspace.logoUrl,
              limits,
            };
            
            set({ currentWorkspace: formattedWorkspace, isLoading: false });
            return formattedWorkspace;
          }
          return null;
        } catch (error) {
          if ((error as Error).message !== 'unauthorized') {
            set({ error: (error as Error).message });
          }
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      createWorkspace: async (workspaceData: CreateWorkspaceData) => {
        const { user } = useAuthStore.getState();
        if (!user) throw new Error('Not authenticated');

        set({ isLoading: true, error: null });
        try {
          const data = await workspaceFetch('/api/user/workspaces', {
            method: 'POST',
            body: JSON.stringify(workspaceData),
          });

          if (data.data?.workspace) {
            const newWorkspace = data.data.workspace;
            set((state) => ({
              workspaces: [...state.workspaces, newWorkspace],
              currentWorkspace: newWorkspace,
              isLoading: false,
            }));
            
            return newWorkspace;
          }
          return null;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      updateWorkspace: async (workspaceId: string, data: UpdateWorkspaceData) => {
        const { user } = useAuthStore.getState();
        if (!user) throw new Error('Not authenticated');

        set({ isUpdating: true, error: null });
        try {
          const responseData = await workspaceFetch(`/api/workspace/${workspaceId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          });

          console.log(`Workspace ${workspaceId} updated successfully`, responseData);

          if (responseData.data?.workspace) {
            const updatedWorkspace = responseData.data.workspace;
            set((state) => ({
              workspaces: state.workspaces.map((w) =>
                w.id === workspaceId ? { ...w, ...updatedWorkspace } : w
              ),
              currentWorkspace: state.currentWorkspace?.id === workspaceId
                ? { ...state.currentWorkspace, ...updatedWorkspace, logo: updatedWorkspace.logoUrl }
                : state.currentWorkspace,
              isUpdating: false,
            }));
            
            return updatedWorkspace;
          }
          return null;
        } catch (error) {
          set({ error: (error as Error).message, isUpdating: false });
          throw error;
        }
      },

      deleteWorkspace: async (workspaceId: string) => {
        const { user } = useAuthStore.getState();
        if (!user) throw new Error('Not authenticated');

        set({ isLoading: true, error: null });
        try {
          await workspaceFetch(`/api/workspace/${workspaceId}`, {
            method: 'DELETE',
          });

          set((state) => {
            const newWorkspaces = state.workspaces.filter((w) => w.id !== workspaceId);
            const newCurrentWorkspace = state.currentWorkspace?.id === workspaceId 
              ? (newWorkspaces.length > 0 ? newWorkspaces[0] as WorkspaceDetails : null)
              : state.currentWorkspace;

            return {
              workspaces: newWorkspaces,
              currentWorkspace: newCurrentWorkspace,
              isLoading: false,
            };
          });

          return true;
        } catch (error) {
          if ((error as Error).message === 'unauthorized') {
            set({ isLoading: false });
            return false;
          }
          set({ error: (error as Error).message, isLoading: false });
          return false;
        }
      },

      setCurrentWorkspace: (workspace) => {
        set({ currentWorkspace: workspace });
      },

      setCurrentWorkspaceById: (workspaceId: string) => {
        const { workspaces } = get();
        const workspace = workspaces.find(w => w.id === workspaceId);
        if (workspace) {
          set({ currentWorkspace: workspace as WorkspaceDetails });
          return workspace;
        }
        return null;
      },

      fetchWorkspaceMembers: async (workspaceId: string) => {
        const { user } = useAuthStore.getState();
        if (!user) return [];

        set({ isLoading: true, error: null });
        try {
          const data = await workspaceFetch(`/api/workspace/${workspaceId}/members`);
          
          if (data.data?.members) {
            return data.data.members;
          }
          return [];
        } catch (error) {
          if ((error as Error).message !== 'unauthorized') {
            set({ error: (error as Error).message });
          }
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      updateMemberRole: async (workspaceId: string, memberId: string, role: string) => {
        const { user } = useAuthStore.getState();
        if (!user) throw new Error('Not authenticated');

        set({ isUpdating: true, error: null });
        try {
          await workspaceFetch(`/api/workspace/${workspaceId}/members/${memberId}`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
          });

          await get().fetchWorkspaceById(workspaceId);
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        } finally {
          set({ isUpdating: false });
        }
      },

      removeMember: async (workspaceId: string, memberId: string) => {
        const { user } = useAuthStore.getState();
        if (!user) throw new Error('Not authenticated');

        set({ isUpdating: true, error: null });
        try {
          await workspaceFetch(`/api/workspace/${workspaceId}/members/${memberId}`, {
            method: 'DELETE',
          });

          await get().fetchWorkspaceById(workspaceId);
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        } finally {
          set({ isUpdating: false });
        }
      },

      fetchInvitations: async (workspaceId?: string) => {
        const { user } = useAuthStore.getState();
        if (!user) return [];

        set({ isLoading: true, error: null });
        try {
          const url = workspaceId 
            ? `/api/workspace/invitations?workspaceId=${workspaceId}`
            : '/api/workspace/invitations';
          
          const data = await workspaceFetch(url);
          
          if (data.data?.invitations) {
            set({ invitations: data.data.invitations, isLoading: false });
            return data.data.invitations;
          }
          return [];
        } catch (error) {
          if ((error as Error).message !== 'unauthorized') {
            set({ error: (error as Error).message });
          }
          return [];
        } finally {
          set({ isLoading: false });
        }
      },


      sendInvitations: async (workspaceId: string, invitations: { email: string; role: string }[]) => {
        const { user } = useAuthStore.getState();
        if (!user) throw new Error('Not authenticated');

        set({ isLoading: true, error: null });
        try {
          const data = await workspaceFetch('/api/workspace/invitations', {
            method: 'POST',
            body: JSON.stringify({ workspaceId, invitations }),
          });

          await get().fetchInvitations(workspaceId);
          
          return data.data;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      acceptInvitation: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await workspaceFetch(`/api/invite/${code}/accept`, {
            method: 'POST',
          });

          await get().fetchWorkspaces();
          
          set({ isLoading: false });
          
          return { 
            success: true, 
            workspaceId: data.data.workspaceId,
            workspaceSlug: data.data.workspaceSlug,
            role: data.data.role
          };
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      declineInvitation: async (invitationId: string) => {
        set({ isLoading: true, error: null });
        try {
          await workspaceFetch(`/api/invite/${invitationId}/decline`, {
            method: 'POST',
          });

          set((state) => ({
            pendingInvitations: state.pendingInvitations.filter(inv => inv.id !== invitationId),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      cancelInvitation: async (invitationId: string) => {
        const { user } = useAuthStore.getState();
        if (!user) throw new Error('Not authenticated');

        set({ isLoading: true, error: null });
        try {
          await workspaceFetch(`/api/workspace/invitations/${invitationId}`, {
            method: 'DELETE',
          });

          await get().fetchInvitations();
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchPendingInvitations: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await workspaceFetch('/api/user/pending-invitations');
          
          if (data.data?.invitations) {
            set({ pendingInvitations: data.data.invitations, isLoading: false });
            return data.data.invitations;
          }
          return [];
        } catch (error) {
          if ((error as Error).message !== 'unauthorized') {
            set({ error: (error as Error).message });
          }
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),

      clearWorkspaces: () => {
        set({
          workspaces: [],
          currentWorkspace: null,
          invitations: [],
          pendingInvitations: [],
        });
      },
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({ 
        workspaces: state.workspaces,
        currentWorkspace: state.currentWorkspace 
      }),
    }
  )
);




