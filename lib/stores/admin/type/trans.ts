// lib/stores/type/trans.ts
export interface AdminSubscriptionTransaction {
  id: string;
  workspaceId: string;
  workspaceName: string;
  userEmail: string;
  userId?: string;
  type: 'SUBSCRIPTION_PAYMENT' | 'SUBSCRIPTION_RENEWAL' | 'SUBSCRIPTION_UPGRADE' | 'SUBSCRIPTION_DOWNGRADE' | 'SUBSCRIPTION_REFUND';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  amount: number;
  description: string;
  referenceId?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  subscriptionId?: string;
  tier?: string;
  discount?: number;
  promoCode?: string;
  paidAt?: string;
  createdAt: string;
  metadata?: any;
}

export interface AdminPromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  minPlanTier: string | null;
  appliesToPlans: string[] | null;
  firstTimeOnly: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalTransactions: number;
  totalRevenue: number;
  activeSubscriptions: number;
  mrr: number;
  activePromoCodes: number;
  totals?: {
    payments: number;
    renewals: number;
    upgrades: number;
    refunds: number;
    net: number;
  };
}

export interface CreatePromoData {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxUses?: number;
  validFrom: string;
  validUntil: string;
  minPlanTier?: 'STARTER' | 'PROFESSIONAL' | 'BUSINESS' | 'ENTERPRISE';
  appliesToPlans?: string[];
  firstTimeOnly?: boolean;
}