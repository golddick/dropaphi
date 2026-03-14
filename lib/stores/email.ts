
// lib/stores/email/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { 
  CreateCampaignData, 
  Email, 
  EmailCampaign, 
  EmailFromType, 
  EmailStatus,
  EmailTemplate, 
  SaveTemplateData, 
  SendEmailData,
  EmailStats
} from '../email/types';
import { useWorkspaceStore } from './workspace';

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
    if (response.status === 401) {
      throw new Error('unauthorized');
    }
    throw new Error(data.message || data.error || 'Request failed');
  }

  return data;
};

interface EmailState {
  // State
  templates: EmailTemplate[];
  campaigns: EmailCampaign[];
  emails: Email[];
  recentEmails: Email[];
  selectedEmail: Email | null;
  currentTemplate: EmailTemplate | null;
  currentCampaign: EmailCampaign | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  stats: EmailStats | null;

  // Template Actions
  fetchTemplates: () => Promise<void>;
  fetchTemplate: (templateId: string) => Promise<EmailTemplate | null>;
  createTemplate: (data: SaveTemplateData) => Promise<EmailTemplate | null>;
  updateTemplate: (templateId: string, data: Partial<SaveTemplateData>) => Promise<EmailTemplate | null>;
  deleteTemplate: (templateId: string) => Promise<void>;
  duplicateTemplate: (templateId: string, newName: string) => Promise<EmailTemplate | null>;

  // Campaign Actions
  fetchCampaigns: () => Promise<void>;
  fetchCampaign: (campaignId: string) => Promise<EmailCampaign | null>;
  createCampaign: (data: CreateCampaignData) => Promise<EmailCampaign | null>;
  updateCampaign: (campaignId: string, data: Partial<CreateCampaignData>) => Promise<EmailCampaign | null>;
  deleteCampaign: (campaignId: string) => Promise<void>;

  // Email Actions
  sendEmail: (data: SendEmailData) => Promise<Email | null>;
  sendCampaign: (campaignId: string, templateId?: string) => Promise<void>;
  sendToSubscribers: (campaignId: string, html: string, subject: string) => Promise<void>;
  
  // Email Fetch Actions
  fetchRecentEmails: (limit?: number) => Promise<void>;
  fetchEmails: (page?: number, filters?: Record<string, any>) => Promise<void>;
  fetchEmailById: (id: string) => Promise<void>;
  fetchEmailsByType: (type: EmailFromType, limit?: number) => Promise<void>;
  fetchEmailsByStatus: (status: EmailStatus, limit?: number) => Promise<void>;
  
  // Email Management Actions
  deleteEmail: (id: string) => Promise<void>;
  deleteMultipleEmails: (ids: string[]) => Promise<void>;
  // updateEmailStatus: (id: string, status: EmailStatus, metadata?: any) => Promise<void>;
  retryBouncedEmail: (id: string) => Promise<void>;
  
  // Stats Actions
  fetchStats: () => Promise<void>;

  // Utility Actions
  clearError: () => void; 
  setCurrentTemplate: (template: EmailTemplate | null) => void;
  setCurrentCampaign: (campaign: EmailCampaign | null) => void;
  setSelectedEmail: (email: Email | null) => void;
  clearEmails: () => void;
}

export const useEmailStore = create<EmailState>()(
  persist(
    (set, get) => ({
      // Initial State
      templates: [],
      campaigns: [],
      emails: [],
      recentEmails: [],
      selectedEmail: null,
      currentTemplate: null,
      currentCampaign: null,
      isLoading: false,
      isSending: false,
      error: null,
      totalCount: 0,
      currentPage: 1,
      pageSize: 20,
      stats: null,

      // ========================================
      // Template Actions
      // ========================================

      fetchTemplates: async () => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          set({ error: 'No workspace selected' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch(`/api/workspace/${currentWorkspace.id}/email/templates`);
          if (data.data?.templates) {
            set({ templates: data.data.templates });
          }
        } catch (error) {
          console.error('❌ Fetch templates error:', error);
          set({ error: (error as Error).message });
          toast.error('Failed to fetch templates');
        } finally {
          set({ isLoading: false });
        }
      },

      fetchTemplate: async (templateId: string) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          set({ error: 'No workspace selected' });
          return null;
        }

        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch(`/api/workspace/${currentWorkspace.id}/email/templates/${templateId}`);
          if (data.data?.template) {
            return data.data.template;
          }
          return null;
        } catch (error) {
          console.error('❌ Fetch template error:', error);
          set({ error: (error as Error).message });
          toast.error('Failed to fetch template');
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      createTemplate: async (data: SaveTemplateData) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          const error = 'No workspace selected';
          set({ error });
          toast.error(error);
          throw new Error(error);
        }

        set({ isLoading: true, error: null });
        try {
          const response = await apiFetch(`/api/workspace/${currentWorkspace.id}/email/templates`, {
            method: 'POST',
            body: JSON.stringify(data),
          });

          if (response.data?.template) {
            const newTemplate = response.data.template;
            set((state) => ({
              templates: [...state.templates, newTemplate],
            }));
            toast.success('Template created successfully');
            return newTemplate;
          }
          return null;
        } catch (error) {
          console.error('❌ Create template error:', error);
          const errorMessage = (error as Error).message;
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateTemplate: async (templateId: string, data: Partial<SaveTemplateData>) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          const error = 'No workspace selected';
          set({ error });
          toast.error(error);
          throw new Error(error);
        }

        set({ isLoading: true, error: null });
        try {
          const response = await apiFetch(`/api/workspace/${currentWorkspace.id}/email/templates/${templateId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          });

          if (response.data?.template) {
            const updatedTemplate = response.data.template;
            set((state) => ({
              templates: state.templates.map((t) => 
                t.id === templateId ? updatedTemplate : t
              ),
              currentTemplate: state.currentTemplate?.id === templateId ? updatedTemplate : state.currentTemplate,
            }));
            toast.success('Template updated successfully');
            return updatedTemplate;
          }
          return null;
        } catch (error) {
          console.error('❌ Update template error:', error);
          const errorMessage = (error as Error).message;
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteTemplate: async (templateId: string) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          const error = 'No workspace selected';
          set({ error });
          toast.error(error);
          throw new Error(error);
        }

        set({ isLoading: true, error: null });
        try {
          await apiFetch(`/api/workspace/${currentWorkspace.id}/email/templates/${templateId}`, {
            method: 'DELETE',
          });

          set((state) => ({
            templates: state.templates.filter((t) => t.id !== templateId),
            currentTemplate: state.currentTemplate?.id === templateId ? null : state.currentTemplate,
          }));
          toast.success('Template deleted successfully');
        } catch (error) {
          console.error('❌ Delete template error:', error);
          const errorMessage = (error as Error).message;
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      duplicateTemplate: async (templateId: string, newName: string) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          const error = 'No workspace selected';
          set({ error });
          toast.error(error);
          throw new Error(error);
        }

        set({ isLoading: true, error: null });
        try {
          const response = await apiFetch(`/api/workspace/${currentWorkspace.id}/email/templates/${templateId}/duplicate`, {
            method: 'POST',
            body: JSON.stringify({ name: newName }),
          });

          if (response.data?.template) {
            const newTemplate = response.data.template;
            set((state) => ({
              templates: [...state.templates, newTemplate],
            }));
            toast.success('Template duplicated successfully');
            return newTemplate;
          }
          return null;
        } catch (error) {
          console.error('❌ Duplicate template error:', error);
          const errorMessage = (error as Error).message;
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // ========================================
      // Campaign Actions
      // ========================================

      fetchCampaigns: async () => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          set({ error: 'No workspace selected' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch(`/api/workspace/${currentWorkspace.id}/email/campaigns`);
          if (data.data?.campaigns) {
            set({ campaigns: data.data.campaigns });
          }
        } catch (error) {
          console.error('❌ Fetch campaigns error:', error);
          set({ error: (error as Error).message });
          toast.error('Failed to fetch campaigns');
        } finally {
          set({ isLoading: false });
        }
      },

      fetchCampaign: async (campaignId: string) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          set({ error: 'No workspace selected' });
          return null;
        }

        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch(`/api/workspace/${currentWorkspace.id}/email/campaigns/${campaignId}`);
          if (data.data?.campaign) {
            return data.data.campaign;
          }
          return null;
        } catch (error) {
          console.error('❌ Fetch campaign error:', error);
          set({ error: (error as Error).message });
          toast.error('Failed to fetch campaign');
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      createCampaign: async (data: CreateCampaignData) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          const error = 'No workspace selected';
          set({ error });
          toast.error(error);
          throw new Error(error);
        }

        set({ isLoading: true, error: null });
        try {
          const response = await apiFetch(`/api/workspace/${currentWorkspace.id}/email/campaigns`, {
            method: 'POST',
            body: JSON.stringify(data),
          });

          if (response.data?.campaign) {
            const newCampaign = response.data.campaign;
            set((state) => ({
              campaigns: [...state.campaigns, newCampaign],
            }));
            toast.success('Campaign created successfully');
            return newCampaign;
          }
          return null;
        } catch (error) {
          console.error('❌ Create campaign error:', error);
          const errorMessage = (error as Error).message;
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateCampaign: async (campaignId: string, data: Partial<CreateCampaignData>) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          const error = 'No workspace selected';
          set({ error });
          toast.error(error);
          throw new Error(error);
        }

        set({ isLoading: true, error: null });
        try {
          const response = await apiFetch(`/api/workspace/${currentWorkspace.id}/email/campaigns/${campaignId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          });

          if (response.data?.campaign) {
            const updatedCampaign = response.data.campaign;
            set((state) => ({
              campaigns: state.campaigns.map((c) => 
                c.id === campaignId ? updatedCampaign : c
              ),
              currentCampaign: state.currentCampaign?.id === campaignId ? updatedCampaign : state.currentCampaign,
            }));
            toast.success('Campaign updated successfully');
            return updatedCampaign;
          }
          return null;
        } catch (error) {
          console.error('❌ Update campaign error:', error);
          const errorMessage = (error as Error).message;
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteCampaign: async (campaignId: string) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          const error = 'No workspace selected';
          set({ error });
          toast.error(error);
          throw new Error(error);
        }

        set({ isLoading: true, error: null });
        try {
          await apiFetch(`/api/workspace/${currentWorkspace.id}/email/campaigns/${campaignId}`, {
            method: 'DELETE',
          });

          set((state) => ({
            campaigns: state.campaigns.filter((c) => c.id !== campaignId),
            currentCampaign: state.currentCampaign?.id === campaignId ? null : state.currentCampaign,
          }));
          toast.success('Campaign deleted successfully');
        } catch (error) {
          console.error('❌ Delete campaign error:', error);
          const errorMessage = (error as Error).message;
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // ========================================
      // Email Actions
      // ========================================

      sendEmail: async (data: SendEmailData) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          const error = 'No workspace selected';
          set({ error });
          toast.error(error);
          throw new Error(error);
        }

        set({ isSending: true, error: null });
        try {
          const response = await apiFetch(`/api/workspace/${currentWorkspace.id}/email`, {
            method: 'POST',
            body: JSON.stringify(data),
          });

          if (response.data?.email) {
            const newEmail = response.data.email;
            set((state) => ({
              recentEmails: [newEmail, ...state.recentEmails].slice(0, 10),
              emails: [newEmail, ...state.emails],
            }));
            toast.success('Email sent successfully!');
            return newEmail;
          }
          return null;
        } catch (error) {
          console.error('❌ Send email error:', error);
          const errorMessage = (error as Error).message;
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isSending: false });
        }
      },

      sendCampaign: async (campaignId: string, templateId?: string) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          const error = 'No workspace selected';
          set({ error });
          toast.error(error);
          throw new Error(error);
        }

        set({ isSending: true, error: null });
        try {
          await apiFetch(`/api/workspace/${currentWorkspace.id}/email/campaigns/${campaignId}/send`, {
            method: 'POST',
            body: JSON.stringify({ templateId }),
          });

          toast.success('Campaign sending started!');
          
          // Refresh campaigns after sending
          await get().fetchCampaigns();
        } catch (error) {
          console.error('❌ Send campaign error:', error);
          const errorMessage = (error as Error).message;
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isSending: false });
        }
      },

      sendToSubscribers: async (campaignId: string, html: string, subject: string) => {
      const { currentWorkspace } = useWorkspaceStore.getState();
      if (!currentWorkspace?.id) {
        const error = 'No workspace selected';
        set({ error });
        toast.error(error);
        throw new Error(error);
      }

      set({ isSending: true, error: null });
      try {
        const response = await apiFetch(`/api/workspace/${currentWorkspace.id}/email/send-to-subscribers`, {
          method: 'POST',
          body: JSON.stringify({
            campaignId,
            subject,
            html,
          }),
        });

        // The response now has a message field
        toast.success(response.message || 'Email sent to subscribers successfully!');
        return response;
      } catch (error) {
        console.error('❌ Send to subscribers error:', error);
        const errorMessage = (error as Error).message;
        set({ error: errorMessage });
        toast.error(errorMessage);
        throw error;
      } finally {
        set({ isSending: false });
      }
        },
 
      // ========================================
      // Email Fetch Actions
      // ========================================

      fetchRecentEmails: async (limit: number = 10) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          set({ error: 'No workspace selected' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch(`/api/workspace/${currentWorkspace.id}/email/recent?limit=${limit}`);
          if (data.data?.emails) {
            set({ recentEmails: data.data.emails });
          }
        } catch (error) {
          console.error('❌ Fetch recent emails error:', error);
          set({ error: (error as Error).message });
          toast.error('Failed to fetch recent emails');
        } finally {
          set({ isLoading: false });
        }
      },

      fetchEmails: async (page = 1, filters = {}) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          set({ error: 'No workspace selected' });
          return;
        }

        const { pageSize } = get();
        set({ isLoading: true, error: null });

        try {
          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: pageSize.toString(),
            ...Object.fromEntries(
              Object.entries(filters).map(([key, value]) => [key, String(value)])
            ),
          });

          const data = await apiFetch(
            `/api/workspace/${currentWorkspace.id}/email?${queryParams}`
          );

          if (data.data) {
            set({
              emails: data.data.emails || [],
              totalCount: data.data.total || 0,
              currentPage: page,
            });
          }
        } catch (error) {
          console.error('❌ Fetch emails error:', error);
          set({ error: (error as Error).message });
          toast.error('Failed to fetch emails');
        } finally {
          set({ isLoading: false });
        }
      },

      fetchEmailById: async (id: string) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          set({ error: 'No workspace selected' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const data = await apiFetch(
            `/api/workspace/${currentWorkspace.id}/email/${id}`
          );

          if (data.data) {
            set({ selectedEmail: data.data });
          }
        } catch (error) {
          console.error('❌ Fetch email by ID error:', error);
          set({ error: (error as Error).message });
          toast.error('Failed to fetch email');
        } finally {
          set({ isLoading: false });
        }
      },

      fetchEmailsByType: async (type: EmailFromType, limit?: number) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          set({ error: 'No workspace selected' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const queryParams = new URLSearchParams({
            type,
            ...(limit && { limit: limit.toString() })
          });

          const data = await apiFetch(
            `/api/workspace/${currentWorkspace.id}/email/by-type?${queryParams}`
          );

          if (data.data?.emails) {
            set({ emails: data.data.emails });
          }
        } catch (error) {
          console.error('❌ Fetch emails by type error:', error);
          set({ error: (error as Error).message });
          toast.error('Failed to fetch emails by type');
        } finally {
          set({ isLoading: false });
        }
      },

      fetchEmailsByStatus: async (status: EmailStatus, limit?: number) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          set({ error: 'No workspace selected' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const queryParams = new URLSearchParams({
            status,
            ...(limit && { limit: limit.toString() })
          });

          const data = await apiFetch(
            `/api/workspace/${currentWorkspace.id}/email/by-status?${queryParams}`
          );

          if (data.data?.emails) {
            set({ emails: data.data.emails });
          }
        } catch (error) {
          console.error('❌ Fetch emails by status error:', error);
          set({ error: (error as Error).message });
          toast.error('Failed to fetch emails by status');
        } finally {
          set({ isLoading: false });
        }
      },

      // ========================================
      // Email Management Actions
      // ========================================

      deleteEmail: async (id: string) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          set({ error: 'No workspace selected' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          await apiFetch(
            `/api/workspace/${currentWorkspace.id}/email/${id}`,
            { method: 'DELETE' }
          );

          set((state) => ({
            emails: state.emails.filter((email) => email.id !== id),
            recentEmails: state.recentEmails.filter((email) => email.id !== id),
            selectedEmail: state.selectedEmail?.id === id ? null : state.selectedEmail,
          }));
          
          toast.success('Email deleted successfully');
        } catch (error) {
          console.error('❌ Delete email error:', error);
          set({ error: (error as Error).message });
          toast.error('Failed to delete email');
        } finally {
          set({ isLoading: false });
        }
      },

      deleteMultipleEmails: async (ids: string[]) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          set({ error: 'No workspace selected' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          await apiFetch(
            `/api/workspace/${currentWorkspace.id}/email/bulk-delete`,
            {
              method: 'POST',
              body: JSON.stringify({ ids }),
            }
          );

          set((state) => ({
            emails: state.emails.filter((email) => !ids.includes(email.id)),
            recentEmails: state.recentEmails.filter((email) => !ids.includes(email.id)),
            selectedEmail: state.selectedEmail && ids.includes(state.selectedEmail.id) 
              ? null 
              : state.selectedEmail,
          }));
          
          toast.success(`${ids.length} emails deleted successfully`);
        } catch (error) {
          console.error('❌ Bulk delete emails error:', error);
          set({ error: (error as Error).message });
          toast.error('Failed to delete emails');
        } finally {
          set({ isLoading: false });
        }
      },

      // updateEmailStatus: async (id: string, status: EmailStatus, metadata?: any) => {
      //   const { currentWorkspace } = useWorkspaceStore.getState();
      //   if (!currentWorkspace?.id) {
      //     set({ error: 'No workspace selected' });
      //     return;
      //   }

      //   try {
      //     const data = await apiFetch(
      //       `/api/workspace/${currentWorkspace.id}/email/${id}/status`,
      //       {
      //         method: 'PATCH',
      //         body: JSON.stringify({ status, metadata }),
      //       }
      //     );

      //     if (data.data) {
      //       set((state) => ({
      //         emails: state.emails.map((email) =>
      //           email.id === id ? { ...email, ...data.data } : email
      //         ),
      //         recentEmails: state.recentEmails.map((email) =>
      //           email.id === id ? { ...email, ...data.data } : email
      //         ),
      //         selectedEmail: state.selectedEmail?.id === id
      //           ? { ...state.selectedEmail, ...data.data }
      //           : state.selectedEmail,
      //       }));
      //     }
      //   } catch (error) {
      //     console.error('❌ Update email status error:', error);
      //     set({ error: (error as Error).message });
      //     toast.error('Failed to update email status');
      //   }
      // },

      retryBouncedEmail: async (id: string) => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          set({ error: 'No workspace selected' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const data = await apiFetch(
            `/api/workspace/${currentWorkspace.id}/email/${id}/retry`,
            { method: 'POST' }
          );

          if (data.data) {
            set((state) => ({
              emails: state.emails.map((email) =>
                email.id === id ? { ...email, ...data.data } : email
              ),
              recentEmails: state.recentEmails.map((email) =>
                email.id === id ? { ...email, ...data.data } : email
              ),
              selectedEmail: state.selectedEmail?.id === id
                ? { ...state.selectedEmail, ...data.data }
                : state.selectedEmail,
            }));
            
            toast.success('Email retry initiated successfully');
          }
        } catch (error) {
          console.error('❌ Retry email error:', error);
          set({ error: (error as Error).message });
          toast.error('Failed to retry email');
        } finally {
          set({ isLoading: false });
        }
      },

      // ========================================
      // Stats Actions
      // ========================================

      fetchStats: async () => {
        const { currentWorkspace } = useWorkspaceStore.getState();
        if (!currentWorkspace?.id) {
          set({ error: 'No workspace selected' });
          return;
        }

        try {
          const data = await apiFetch(`/api/workspace/${currentWorkspace.id}/email/stats`);
          if (data.data?.stats) {
            set({ stats: data.data.stats });
          }
        } catch (error) {
          console.error('❌ Fetch email stats error:', error);
          toast.error('Failed to fetch email statistics');
        }
      },

      // ========================================
      // Utility Actions
      // ========================================

      clearError: () => set({ error: null }),
      
      setCurrentTemplate: (template) => set({ currentTemplate: template }),
      
      setCurrentCampaign: (campaign) => set({ currentCampaign: campaign }),
      
      setSelectedEmail: (email) => set({ selectedEmail: email }),
      
      clearEmails: () => set({ 
        emails: [], 
        recentEmails: [], 
        selectedEmail: null,
        totalCount: 0,
        currentPage: 1 
      }),
    }),
    {
      name: 'email-storage',
      partialize: (state) => ({
        // Only persist non-sensitive data
        templates: state.templates,
        campaigns: state.campaigns,
        stats: state.stats,
      }),
    }
  )
);