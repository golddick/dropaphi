// lib/stores/email/index.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

export interface EmailSender {
  id: string;
  workspaceId: string;
  email: string;
  name: string;
  verified: boolean;
  verifiedAt?: string | null;
  spfVerified?: boolean;
  dkimVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DNSRecord {
  type: string;
  name: string;
  value: string;
  priority?: number;
  verified: boolean;
}

export interface VerificationState {
  isSending: boolean;
  countdown: number;
  error: string | null;
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
    if (response.status === 401) {
      throw new Error('unauthorized');
    }
    throw new Error(data.message || data.error || 'Request failed');
  }

  return data;
};

interface EmailSenderStore {
  // State
  senders: EmailSender[];
  currentSender: EmailSender | null;
  isLoading: boolean;
  error: string | null;
  verificationState: VerificationState;

  // Actions
  fetchSenders: (workspaceId: string) => Promise<void>;
  addSender: (workspaceId: string, data: { email: string; name: string }) => Promise<EmailSender>;
  updateSender: (workspaceId: string, id: string, data: Partial<EmailSender>) => Promise<EmailSender>;
  deleteSender: (id: string) => Promise<void>;
  sendVerificationCode: (workspaceId: string, email: string) => Promise<void>;
  verifySender: (workspaceId: string, data: { email: string; code: string; senderId: string }) => Promise<void>;
  checkDNSRecords: (senderId: string) => Promise<{ spf: boolean; dkim: boolean }>;
  setCurrentSender: (sender: EmailSender | null) => void;
  clearError: () => void;
}

export const useEmailSenderStore = create<EmailSenderStore>()(
  persist(
    (set, get) => ({
      // Initial State
      senders: [],
      currentSender: null,
      isLoading: false,
      error: null,
      verificationState: {
        isSending: false,
        countdown: 0,
        error: null,
      },

      // Fetch all senders for workspace
      fetchSenders: async (workspaceId: string) => {
        if (!workspaceId) {
          set({ error: 'No workspace ID provided' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const data = await apiFetch(`/api/workspace/${workspaceId}/email-senders`);
          
          if (data.success && data.data?.senders) {
            set({ senders: data.data.senders });
          } else if (data.data) {
            set({ senders: data.data });
          }
        } catch (error) {
          console.error('❌ Fetch senders error:', error);
          set({ error: (error as Error).message });
          toast.error('Failed to fetch email senders');
        } finally {
          set({ isLoading: false });
        }
      },

      // Add new sender
      addSender: async (workspaceId: string, data: { email: string; name: string }) => {
        if (!workspaceId) {
          const error = 'No workspace ID provided';
          set({ error });
          toast.error(error);
          throw new Error(error);
        }

        set({ isLoading: true, error: null });

        try {
          const response = await apiFetch(`/api/workspace/${workspaceId}/email-senders`, {
            method: 'POST',
            body: JSON.stringify(data),
          });

          if (response.success && response.data?.sender) {
            const newSender = response.data.sender;
            set((state) => ({
              senders: [...state.senders, newSender],
            }));
            toast.success('Email sender added successfully');
            return newSender;
          } else if (response.data) {
            const newSender = response.data;
            set((state) => ({
              senders: [...state.senders, newSender],
            }));
            toast.success('Email sender added successfully');
            return newSender;
          }
          throw new Error('Failed to add sender');
        } catch (error) {
          console.error('❌ Add sender error:', error);
          const errorMessage = (error as Error).message;
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Update sender
      updateSender: async (workspaceId: string, id: string, data: Partial<EmailSender>) => {
        if (!workspaceId) {
          const error = 'No workspace ID provided';
          set({ error });
          toast.error(error);
          throw new Error(error);
        }

        set({ isLoading: true, error: null });

        try {
          const response = await apiFetch(`/api/workspace/${workspaceId}/email-senders/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          });

          if (response.success && response.data?.sender) {
            const updatedSender = response.data.sender;
            set((state) => ({
              senders: state.senders.map((s) => (s.id === id ? updatedSender : s)),
              currentSender: state.currentSender?.id === id ? updatedSender : state.currentSender,
            }));
            toast.success('Email sender updated successfully');
            return updatedSender;
          }
          throw new Error('Failed to update sender');
        } catch (error) {
          console.error('❌ Update sender error:', error);
          const errorMessage = (error as Error).message;
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Delete sender
      deleteSender: async (id: string) => {
        const workspaceId = get().currentSender?.workspaceId;
        if (!workspaceId) {
          set({ error: 'No workspace ID' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          await apiFetch(`/api/workspace/${workspaceId}/email-senders/${id}`, {
            method: 'DELETE',
          });

          set((state) => ({
            senders: state.senders.filter((s) => s.id !== id),
            currentSender: state.currentSender?.id === id ? null : state.currentSender,
          }));
          
          toast.success('Email sender deleted successfully');
        } catch (error) {
          console.error('❌ Delete sender error:', error);
          set({ error: (error as Error).message });
          toast.error('Failed to delete sender');
        } finally {
          set({ isLoading: false });
        }
      },

      // Send verification code
      sendVerificationCode: async (workspaceId: string, email: string) => {
        if (!workspaceId || !email) {
          set({ error: 'Missing required data' });
          return;
        }

        set((state) => ({
          verificationState: {
            ...state.verificationState,
            isSending: true,
            error: null,
          },
        }));

        try {
          await apiFetch(`/api/workspace/${workspaceId}/email-senders/verify/send`, {
            method: 'POST',
            body: JSON.stringify({ email }),
          });

          // Start countdown
          set((state) => ({
            verificationState: {
              ...state.verificationState,
              isSending: true,
              countdown: 60,
            },
          }));

          // Countdown timer
          const timer = setInterval(() => {
            set((state) => {
              const newCountdown = state.verificationState.countdown - 1;
              if (newCountdown <= 0) {
                clearInterval(timer);
                return {
                  verificationState: {
                    ...state.verificationState,
                    isSending: false,
                    countdown: 0,
                  },
                };
              }
              return {
                verificationState: {
                  ...state.verificationState,
                  countdown: newCountdown,
                },
              };
            });
          }, 1000);

          toast.success('Verification code sent');
        } catch (error) {
          console.error('❌ Send verification error:', error);
          set((state) => ({
            verificationState: {
              ...state.verificationState,
              isSending: false,
              error: (error as Error).message,
            },
          }));
          toast.error('Failed to send verification code');
        }
      },

      // Verify sender with OTP
      verifySender: async (workspaceId: string, data: { email: string; code: string; senderId: string }) => {
        if (!workspaceId || !data.email || !data.code || !data.senderId) {
          set({ error: 'Missing required data' });
          throw new Error('Missing required data');
        }

        set({ isLoading: true, error: null });

        try {
          const response = await apiFetch(`/api/workspace/${workspaceId}/email-senders/verify`, {
            method: 'POST',
            body: JSON.stringify(data),
          });

          if (response.success && response.data?.sender) {
            const verifiedSender = response.data.sender;
            set((state) => ({
              senders: state.senders.map((s) => (s.id === data.senderId ? verifiedSender : s)),
              currentSender: state.currentSender?.id === data.senderId ? verifiedSender : state.currentSender,
            }));
            toast.success('Email verified successfully');
          } else if (response.data) {
            const verifiedSender = response.data;
            set((state) => ({
              senders: state.senders.map((s) => (s.id === data.senderId ? verifiedSender : s)),
              currentSender: state.currentSender?.id === data.senderId ? verifiedSender : state.currentSender,
            }));
            toast.success('Email verified successfully');
          }
        } catch (error) {
          console.error('❌ Verify sender error:', error);
          const errorMessage = (error as Error).message;
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Check DNS records (SPF, DKIM)
      checkDNSRecords: async (senderId: string) => {
        const sender = get().senders.find((s) => s.id === senderId);
        if (!sender) {
          throw new Error('Sender not found');
        }

        // This is a mock implementation - replace with actual DNS checking
        // You would need to implement a real DNS check API endpoint
        const mockResult = {
          spf: Math.random() > 0.5,
          dkim: Math.random() > 0.5,
        };

        // Update sender with DNS status
        set((state) => ({
          senders: state.senders.map((s) =>
            s.id === senderId
              ? { ...s, spfVerified: mockResult.spf, dkimVerified: mockResult.dkim }
              : s
          ),
        }));

        return mockResult;
      },

      // Set current sender
      setCurrentSender: (sender: EmailSender | null) => {
        set({ currentSender: sender });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'email-sender-storage',
      partialize: (state) => ({
        // Only persist non-sensitive data
        senders: state.senders,
      }),
    }
  )
);