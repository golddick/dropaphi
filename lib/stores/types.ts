








// lib/stores/workspace.types.ts

export enum WorkspaceRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  WRITER = 'WRITER',
  DEVELOPER = 'DEVELOPER',
  VIEWER = 'VIEWER'
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  industry?: string | null;
  teamSize?: string | null;
  timezone?: string;
  role?: WorkspaceRole;
  joinedAt?: string;
  createdAt: string;
  
  // Limits
  subscriberLimit?: number;
  emailLimit?: number;
  fileLimit?: number;
  smsLimit?: number;
  otpLimit?: number;
  
  // Usage
  currentSubscribers?: number;
  currentEmailsSent?: number;
  currentFilesUsed?: number;
  currentSmsSent?: number;
  currentOtpSent?: number;
  
  // Subscription
  subscription?: {
    id: string;
    tier: string;
    status: string;
    monthlyPrice: number;
    periodStart: string;
    periodEnd: string;
  };
  
  // Counts
  counts?: {
    members: number;
    apiKeys: number;
    subscribers: number;
    files: number;
  };
}

export interface WorkspaceMember {
  id: string;
  role: WorkspaceRole;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
}

export interface WorkspaceDetails extends Workspace {
  members: WorkspaceMember[];
  invitations?: Invitation[];
  isActive: boolean;
  limits: {
    subscribers: { limit: number; used: number; remaining: number; percentage: number };
    emails: { limit: number; used: number; remaining: number; percentage: number };
    files: { limit: number; used: number; remaining: number; percentage: number };
    sms: { limit: number; used: number; remaining: number; percentage: number };
    otp: { limit: number; used: number; remaining: number; percentage: number };
  };
}

export interface Invitation {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  invitedBy: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  createdAt: string;
  inviterName?: string;
  inviterEmail?: string;
  workspaceName?: string;
}

export interface CreateWorkspaceData {
  name: string;
  website?: string;
  industry?: string;
  teamSize?: string;
  description?: string;
}

export interface UpdateWorkspaceData {
  name?: string;
  website?: string | null;
  industry?: string | null;
  teamSize?: string | null;
  description?: string | null;
  timezone?: string;
}

export interface InviteMemberData {
  email: string;
  role: WorkspaceRole;
}

export interface EmailSender {
  id: string;
  workspaceId: string;
  email: string;
  name: string;
  verified: boolean;
  spfVerified: boolean;
  dkimVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailSenderFormData {
  email: string;
  name: string;
}

export interface EmailSenderVerificationData {
  email: string;
  code: string;
  senderId: string;
}


export interface Subscription {
  id: string;
  workspaceId: string;
  tier: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'BUSINESS' ;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
  monthlyPrice: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  paymentRef: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Add these for UI convenience
  limits?: {
    sms: number;
    email: number;
    otp: number;
    storage: number;
    subscribers: number;
  };
  usage?: {
    sms: number;
    email: number;
    otp: number;
    storage: number;
    subscribers: number;
  };
}

export interface Invoice {
  id: string;
  workspaceId: string;
  invoiceNumber: string;
  amount: number;
  discount: number;
  finalAmount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentRef: string | null;
  paidAt: string | null;
  periodStart: string;
  periodEnd: string;
  promoCode?: string;
  createdAt: string;
}

export interface PromoCode {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  validUntil?: string;
}



export enum ApiKeyStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED'
}


export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  key?: string;
  lastFourChars: string;
  maskedKey: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'REVOKED';
  permissions: Record<string, any>;
  rateLimitPerMin: number;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiKeyData {
  name: string;
  environment: 'live' | 'test';
  expiresIn?: number;
  permissions?: Record<string, any>;
  rateLimit?: number;
}

export interface UpdateApiKeyData {
  name?: string;
  status?: ApiKeyStatus;
  permissions?: Record<string, any>;
  rateLimitPerMin?: number;
  expiresAt?: string | null;
}

export interface ApiKeyStats {
  totalKeys: number;
  activeKeys: number;
  liveKeys: number;
  testKeys: number;
  totalCalls: number;
  averageCallsPerDay: number;
}