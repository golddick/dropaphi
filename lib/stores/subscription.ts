

// lib/stores/subscription.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// import { Subscription, Invoice, PromoCode } from './subscription.types';
import { getPlanByTier } from '@/lib/billing/plan';
import { useWorkspaceStore } from './workspace';
import { Invoice, PromoCode, Subscription } from './types';

export interface SubscriptionState {
  // State
  subscription: Subscription | null;
  invoices: Invoice[];
  promoCodes: PromoCode[];
  appliedPromo: PromoCode | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSubscription: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  fetchPromoCodes: () => Promise<void>;
  validatePromoCode: (code: string, planTier?: string) => Promise<PromoCode>;
  applyPromoCode: (promo: PromoCode) => void;
  removePromoCode: () => void;
  initializeSubscription: (tier: string, promoCode?: string) => Promise<{ authorization_url: string }>;
  cancelSubscription: () => Promise<void>;
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

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: null,
      invoices: [],
      promoCodes: [],
      appliedPromo: null,
      isLoading: false,
      error: null,

      fetchSubscription: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch('/api/billing/subscription');
          console.log('✅ Subscription data:', data);
          
          if (data.data?.subscription) {
            const sub = data.data.subscription;
            const plan = getPlanByTier(sub.tier);
            
            // Get workspace usage from workspace store
            const { currentWorkspace } = useWorkspaceStore.getState();
            
            // Enhance subscription with limits and usage
            const enhancedSubscription: Subscription = {
              ...sub,
              limits: plan ? {
                sms: plan.limits.sms,
                email: plan.limits.email,
                otp: plan.limits.otp,
                storage: plan.limits.storage,
                subscribers: plan.limits.email, // Adjust as needed
              } : {
                sms: 0,
                email: 0,
                otp: 0,
                storage: 0,
                subscribers: 0,
              },
              usage: currentWorkspace ? {
                sms: currentWorkspace.currentSmsSent || 0,
                email: currentWorkspace.currentEmailsSent || 0,
                otp: currentWorkspace.currentOtpSent || 0,
                storage: currentWorkspace.currentFilesUsed || 0,
                subscribers: currentWorkspace.currentSubscribers || 0,
              } : {
                sms: 0,
                email: 0,
                otp: 0,
                storage: 0,
                subscribers: 0,
              },
            };
            
            set({ subscription: enhancedSubscription, isLoading: false });
          } else {
            set({ subscription: null, isLoading: false });
          }
        } catch (error) {
          console.error('❌ Fetch subscription error:', error);
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      fetchInvoices: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch('/api/billing/invoices');
          console.log('✅ Invoices data:', data);
          set({ 
            invoices: Array.isArray(data.data?.invoices) ? data.data.invoices : [], 
            isLoading: false 
          });
        } catch (error) {
          console.error('❌ Fetch invoices error:', error);
          set({ invoices: [], error: (error as Error).message, isLoading: false });
        }
      },

      fetchPromoCodes: async () => {
        try {
          const data = await apiFetch('/api/billing/promo/list');
          console.log('✅ Promo codes:', data);
          set({ 
            promoCodes: Array.isArray(data.data?.promoCodes) ? data.data.promoCodes : [] 
          });
        } catch (error) {
          console.error('❌ Fetch promo codes error:', error);
          set({ promoCodes: [] });
        }
      },

      validatePromoCode: async (code: string, planTier?: string) => {
        const data = await apiFetch('/api/billing/promo/validate', {
          method: 'POST',
          body: JSON.stringify({ code, planTier }),
        });
        return data.data;
      },

      applyPromoCode: (promo: PromoCode) => {
        set({ appliedPromo: promo });
      },

      removePromoCode: () => {
        set({ appliedPromo: null });
      },

      initializeSubscription: async (tier: string, promoCode?: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch('/api/billing/subscription/initialize', {
            method: 'POST',
            body: JSON.stringify({ tier, promoCode }),
          });
          console.log('✅ Subscription initialized:', data);
          set({ isLoading: false });
          return data.data;
        } catch (error) {
          console.error('❌ Initialize subscription error:', error);
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      cancelSubscription: async () => {
        set({ isLoading: true, error: null });
        try {
          await apiFetch('/api/billing/subscription/cancel', {
            method: 'POST',
          });
          console.log('✅ Subscription cancelled');
          set({ subscription: null, isLoading: false });
          await get().fetchSubscription(); // Refresh to get free plan
        } catch (error) {
          console.error('❌ Cancel subscription error:', error);
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'subscription-storage',
      partialize: (state) => ({
        appliedPromo: state.appliedPromo,
      }),
    }
  )
);