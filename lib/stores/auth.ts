// lib/stores/auth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, PasswordChangeData, ProfileUpdateData, Session } from './types';
import { formatDistanceToNow, parseUserAgent } from './utils';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  userEmail: string;
  signupMessage: string | null;
  requiresTwoFactor: boolean;
  twoFactorEmail: string | null;
  
  // Auth Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<any>;
  signup: (fullName: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  clearMessages: () => void;
  
  // User Profile Actions
  fetchCurrentUser: (options?: { force?: boolean }) => Promise<AuthUser | null>;
  updateProfile: (data: ProfileUpdateData) => Promise<AuthUser | null>;
  deleteAccount: (password: string) => Promise<boolean>;
  
  // Email Verification
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  
  // Password Reset
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;

  // Security Actions
  changePassword: (data: PasswordChangeData) => Promise<void>;
  getSessions: () => Promise<Session[]>;
  terminateSession: (sessionId: string) => Promise<void>;
  terminateAllSessions: () => Promise<void>;

  // 2FA Actions
  send2FAOTP: () => Promise<void>;
  enable2FA: (code: string) => Promise<{ backupCodes: string[] }>;
  disable2FA: (password: string) => Promise<void>;
  getBackupCodes: () => Promise<string[]>;
  regenerateBackupCodes: () => Promise<string[]>;
  verify2FA: (code: string, rememberDevice?: boolean) => Promise<void>;
  resend2FACode: () => Promise<void>;
  useRecoveryCode: (code: string) => Promise<void>;
  
  // Initialization
  initialize: () => Promise<void>;
}

// Custom fetch with credentials and error handling

const apiFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Try to parse JSON response
  let data;
  try {
    data = await response.json();
  } catch (e) {
    // If response is not JSON, throw error with status
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (!response.ok) {
    // Don't throw for 401 - let the caller handle it
    if (response.status === 401) {
      // But still return the error message if available
      throw new Error(data.message || data.error || 'Unauthorized');
    }
    // Throw with the error message from the server
    throw new Error(data.message || data.error || 'Request failed');
  }

  return data;
};


export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,
      error: null,
      userEmail: '',
      signupMessage: null,
      requiresTwoFactor: false,
      twoFactorEmail: null,

      initialize: async () => {
        // Don't re-initialize if already done
        if (get().isInitialized) return;
        
        set({ isLoading: true });
        try {
          await get().fetchCurrentUser({ force: true });
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },

      login: async (email: string, password: string, ) => {
        set({ isLoading: true, error: null, signupMessage: null });
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            credentials: "include",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

             // Check if response is JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ AuthStore: Non-JSON response:', text.substring(0, 200));
            throw new Error('Server returned non-JSON response');
          }
    
          
          const data = await response.json();
          
          if (!response.ok) {
            if (data.code === 'EMAIL_NOT_VERIFIED') {
              set({ userEmail: email, isLoading: false });
              throw new Error('EMAIL_NOT_VERIFIED');
            } else if (data.code === 'SUSPENDED') {
              throw new Error('Your account has been suspended. Please contact support.');
            } else {
              throw new Error(data.message || 'Login failed');
            }
          }

          // Check if 2FA is required
          if (data.data?.requiresTwoFactor) {
            set({ 
              requiresTwoFactor: true,
              twoFactorEmail: data.data.email,
              isLoading: false 
            });
            return { requiresTwoFactor: true, email: data.data.email };
          }

          // Fetch user profile after successful login
          const user = await get().fetchCurrentUser({ force: true });
          
          set({ isLoading: false });
          
          return { success: true, user };
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      signup: async (fullName: string, email: string, password: string) => {
        set({ isLoading: true, error: null, signupMessage: null });
        try {
          const response = await fetch('/api/auth/sign-up', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            if (data.code === 'WEAK_PASSWORD') {
              throw new Error('Password is too weak');
            } else if (data.code === 'EMAIL_TAKEN') {
              throw new Error('An account with this email already exists');
            } else {
              throw new Error(data.message || 'Signup failed');
            }
          }

          set({ 
            userEmail: email, 
            signupMessage: data.message || 'Account created successfully',
            isLoading: false 
          });
          
          return data;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { 
            method: 'POST', 
            credentials: 'include' 
          });
        } catch (error) {
          console.error('[Logout] Error:', error);
        } finally {
          // Clear all storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage');
            localStorage.removeItem('currentWorkspaceId');
          }
          
          set({ 
            user: null,
            userEmail: '', 
            error: null,
            signupMessage: null,
            isInitialized: true,
            requiresTwoFactor: false,
            twoFactorEmail: null,
          });
        }
      },

      clearMessages: () => {
        set({ error: null, signupMessage: null });
      },

      fetchCurrentUser: async (options = {}) => {
        const { force = false } = options;
        const currentUser = get().user;
        
        // Skip if we already have user data and not forcing refresh
        if (currentUser && !force) {
          return currentUser;
        }

        // Don't set loading if we're just checking
        if (force) {
          set({ isLoading: true });
        }

        try {
          const result = await apiFetch('/api/auth/me');
          
          // Handle unauthorized response
          if (result.error === 'unauthorized') {
            set({ 
              user: null,
              isLoading: false,
              error: null
            });
            return null;
          }
          
          if (result.data) {
            const userData = result.data;
            set({ 
              user: userData, 
              isLoading: false,
              error: null 
            });
            return userData;
          }
          
          set({ 
            user: null, 
            isLoading: false,
            error: null 
          });
          return null;
        } catch (error) {
          console.error('[fetchCurrentUser] Error:', error);
          set({ 
            isLoading: false,
            error: null
          });
          return null;
        }
      },

      updateProfile: async (profileData: ProfileUpdateData) => {
        set({ isLoading: true, error: null });

        console.log('[updateProfile] Updating profile with data:', profileData);
        try {
          const data = await apiFetch('/api/auth/me', {
            method: 'PATCH',
            body: JSON.stringify(profileData),
          });

          if (data.data) {
            set({ user: data.data, isLoading: false });
            return data.data;
          }
          return null;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      deleteAccount: async (password: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiFetch('/api/auth/me', {
            method: 'DELETE',
            body: JSON.stringify({ password }),
          });

          await get().logout();
          return true;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      }, 

      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Verification failed');
          }

          await get().fetchCurrentUser({ force: true });
          
          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      resendVerificationEmail: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/resend-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to resend verification email');
          }

          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      requestPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to send reset email');
          }

          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to reset password');
          }

          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      changePassword: async (data: PasswordChangeData): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
          await apiFetch('/api/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(data),
          });
          
          set({ isLoading: false });
          // Don't return anything - just let it resolve
        } catch (error) {
          console.error('[changePassword] Error:', error);
          set({ error: (error as Error).message, isLoading: false });
          // Re-throw with the actual error message
          throw new Error((error as Error).message || 'Failed to change password');
        }
      },

      getSessions: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch('/api/auth/sessions');
          
           if (data.data && Array.isArray(data.data)) {
      set({ isLoading: false });
      
      // Format the sessions for display
      const formattedSessions = data.data.map((session: any) => ({
        id: session.id,
        device: session.userAgent ? parseUserAgent(session.userAgent) : 'Unknown device',
        location: session.ipAddress ? `IP: ${session.ipAddress}` : 'Unknown location',
        current: session.id === get().user?.Session?.id, // You'll need to store current sessionId
        lastActive: session.lastActiveAt 
          ? formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })
          : 'Unknown',
      }));
      
      return formattedSessions;
    }
          return [];
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          return [];
        }
      },

      terminateSession: async (sessionId: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiFetch(`/api/auth/sessions/${sessionId}`, {
            method: 'DELETE',
          });
          
          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      terminateAllSessions: async () => {
        set({ isLoading: true, error: null });
        try {
          await apiFetch('/api/auth/sessions', {
            method: 'DELETE',
          });
          
          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      send2FAOTP: async () => { 
        set({ isLoading: true, error: null });
        try {
          await apiFetch('/api/auth/2fa/send-otp', {
            method: 'POST',
          });
          
          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      enable2FA: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch('/api/auth/2fa/enable', {
            method: 'POST',
            body: JSON.stringify({ code }),
          });
          
          // Update user's 2FA status
          const currentUser = get().user;
          if (currentUser) {
            set({ 
              user: { ...currentUser, twoFactorEnabled: true },
              isLoading: false 
            });
          }
          
          return data.data;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      disable2FA: async (password: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiFetch('/api/auth/2fa/disable', {
            method: 'POST',
            body: JSON.stringify({ password }),
          });
          
          // Update user's 2FA status
          const currentUser = get().user;
          if (currentUser) {
            set({ 
              user: { ...currentUser, twoFactorEnabled: false },
              isLoading: false 
            });
          }
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      getBackupCodes: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch('/api/auth/2fa/backup-codes');
          set({ isLoading: false });
          return data.data?.codes || [];
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      regenerateBackupCodes: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch('/api/auth/2fa/backup-codes/regenerate', {
            method: 'POST',
          });
          
          set({ isLoading: false });
          return data.data?.codes || [];
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      verify2FA: async (code: string, rememberDevice = false): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
          const email = get().twoFactorEmail; 
          
          if (!email) {
            throw new Error('No active 2FA session');
          }

          const response = await fetch('/api/auth/2fa/verify-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              code, 
              email,
              rememberDevice 
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Verification failed');
          }

          // After successful 2FA, fetch user
          await get().fetchCurrentUser({ force: true });
          
          set({ 
            isLoading: false, 
            requiresTwoFactor: false,
            twoFactorEmail: null 
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      resend2FACode: async (): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
          const email = get().twoFactorEmail;
          
          if (!email) {
            throw new Error('No active 2FA session');
          }

          const response = await fetch('/api/auth/2fa/resend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to resend code');
          }

          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      useRecoveryCode: async (code: string): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
          const email = get().twoFactorEmail;
          
          if (!email) {
            throw new Error('No active 2FA session');
          }

          const response = await fetch('/api/auth/2fa/recovery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, email }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Invalid recovery code');
          }

          // After successful recovery, fetch user
          await get().fetchCurrentUser({ force: true });
          
          set({ 
            isLoading: false, 
            requiresTwoFactor: false,
            twoFactorEmail: null 
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isInitialized: state.isInitialized,
        requiresTwoFactor: state.requiresTwoFactor, 
        twoFactorEmail: state.twoFactorEmail
      }),
    }
  )
);

// Initialize auth on store creation (client-side only)
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize();
}







