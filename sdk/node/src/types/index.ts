export interface DropaphiConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface DropaphiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export interface Attachment {
  filename: string;
  content?: string; // Base64
  url?: string;     // URL method (recommended)
  contentType?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  fromName?: string;
  replyTo?: string;
  template?: 'welcome' | 'newsletter' | 'marketing' | 'notification';
  templateData?: Record<string, any>;
  attachments?: Attachment[];
  cc?: string | string[];
  bcc?: string | string[];
  tracking?: {
    opens?: boolean;
    clicks?: boolean;
  };
}

export interface SubscribeOptions {
  email: string;
  name?: string;
  source?: string;
  templateId?: string;
}

export interface SendOTPOptions {
  email: string;
  brandName?: string;
  length?: number;
  expiry?: number;
  subject?: string;
}

export interface VerifyOTPOptions {
  email: string;
  code: string;
}

export interface UploadFileOptions {
  file: any; // File, Blob, or Buffer
  filename?: string;
  metadata?: Record<string, any>;
}
