// lib/email/services/email-sender.service.ts
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
  headers?: Record<string, string>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailSenderService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Initialize nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.thenews.africa',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Optional: Add pool configuration for better performance
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }

  /**
   * Send an email without saving to database
   * Use this for transactional emails, welcome emails, notifications
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const {
        to,
        subject,
        html,
        text,
        fromEmail = process.env.MAIL_FROM || 'noreply@dropaphi.com',
        fromName = process.env.NAME_FROM || 'DropAphi',
        replyTo,
        attachments,
        headers,
      } = options;

      // Format recipients
      const recipients = Array.isArray(to) ? to.join(', ') : to;

      // Prepare email options
      const mailOptions: nodemailer.SendMailOptions = {
        from: fromName ? `"${fromName}" <${process.env.SMTP_USER}>` : fromEmail,
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
        headers,
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      console.log(`[EMAIL_SENDER] Email sent: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
      };

    } catch (error) {
      console.error('[EMAIL_SENDER] Failed to send:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Send batch emails efficiently
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
      console.error('[EMAIL_SENDER] Transporter verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailSender = new EmailSenderService();