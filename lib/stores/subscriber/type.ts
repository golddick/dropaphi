// lib/stores/subscriber/type.ts
export type SubscriberStatus = 'ACTIVE' | 'UNSUBSCRIBED' | 'BOUNCED';

export interface Subscriber {
  id: string;
  workspaceId: string;
  email: string;
  name?: string | null;
  status: SubscriberStatus;
  segments: string[];
  customFields?: Record<string, any> | null;
  confirmedAt?: string | null;
  unsubscribedAt?: string | null;
  source?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriberStats {
  total: number;
  active: number;
  unsubscribed: number;
  bounced: number;
}

export interface SubscriberFilters {
  status?: SubscriberStatus;
  segment?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateSubscriberData {
  email: string;
  name?: string | null;
  segments?: string[];
  customFields?: Record<string, any>;
  source?: string;
  status?: SubscriberStatus;
}

export interface UpdateSubscriberData {
  name?: string | null;
  segments?: string[];
  customFields?: Record<string, any>;
  status?: SubscriberStatus;
}