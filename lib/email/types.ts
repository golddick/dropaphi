












// lib/stores/email/types.ts

export interface EmailElement {
  id: string
  type: "text" | "image" | "video" | "button" | "social" | "divider" | "columns" | "logo"
  content?: string
  properties?: Record<string, any>
}

export interface EmailTemplate {
  id: string
  workspaceId: string
  name: string
  subject: string
  bodyHtml?: string
  bodyText?: string
  elements: EmailElement[]
  variables?: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface EmailCampaign {
  id: string
  workspaceId: string
  name: string
  subject: string
  templateId?: string
  status: 'DRAFT' | 'SCHEDULED' | 'SENT'
  scheduledAt?: string
  sentAt?: string
  stats: {
    total: number
    sent: number
    opened: number
    clicked: number
    bounced: number
  }
  createdAt: string
  updatedAt: string
}

export type EmailStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'FAILED' ;

export interface Email {
  id: string
  workspaceId: string
  campaignId?: string
  templateId?: string
  fromEmail: string
  fromName?: string
  toEmails: string[]
  ccEmails: string[]
  bccEmails: string[]
  subject: string
  bodyHtml?: string
  bodyText?: string
  status: EmailStatus
  providerRef?: string
  source?: string
  mailSentFrom: EmailFromType;
  openedAt?: string
  clickedAt?: string
  openCount: number;
  clickCount: number;
  deliveredAt?: string
  bouncedAt?: string
  bounceReason?: string
  scheduledAt?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export type EmailFromType = 'IN_APP' | 'API';

export interface SendEmailData {
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  subject: string
  html: string
  text?: string
  fromEmail?: string
  fromName?: string
  campaignId?: string
  templateId?: string
  scheduledAt?: string
}

export interface CreateCampaignData {
  name: string
  subject: string
  templateId?: string
  scheduledAt?: string
}

export interface SaveTemplateData {
  name: string
  subject: string
  elements: EmailElement[]
  variables?: Record<string, any>
}

export interface EmailStats {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalCampaigns: number; 
  totalDelivered:number;
  totalBounced: number;
  totalSpam: number;
  averageOpenRate: number;
  averageClickRate: number;
  bounceRate: number;
  totalTemplates: number;
}
