// lib/email/nodemailer.service.ts
import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class NodemailerService {
  private transporter: nodemailer.Transporter;
  private defaultFromEmail: string;
  private defaultFromName: string;

  constructor() {
    this.defaultFromEmail = process.env.MAIL_FROM || 'noreply@dropaphi.com';
    this.defaultFromName = process.env.NAME_FROM || 'Drop API';
    
    // Initialize nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const {
        to,
        subject,
        html,
        text,
        fromEmail = this.defaultFromEmail,
        fromName = this.defaultFromName,
        replyTo,
        attachments,
      } = options;

      // Format recipients
      const recipients = Array.isArray(to) ? to.join(', ') : to;

      // Prepare email options
      const mailOptions: nodemailer.SendMailOptions = {
        from: fromName ? `"${fromName}" <${fromEmail}>` : fromEmail,
        to: recipients,
        subject,
        html,
        text: text || this.generatePlainText(html),
        replyTo,
        attachments: attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      console.log(`[Nodemailer] Email sent: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
      };

    } catch (error) {
      console.error('[Nodemailer] Failed to send:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Generate plain text from HTML
   */
  private generatePlainText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  /**
   * Verify transporter connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('[Nodemailer] Transporter verification failed:', error);
      return false;
    }
  }

  /**
   * Send batch emails
   */
  async sendBatch(emails: EmailOptions[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    
    for (const email of emails) {
      const result = await this.sendEmail(email);
      results.push(result);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }
}

// Export singleton instance
export const nodemailerService = new NodemailerService();