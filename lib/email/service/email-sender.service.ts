// lib/email/services/email-sender.service.ts
import nodemailer from 'nodemailer';
import { transporter } from '@/lib/transport';
import { db } from '@/lib/db';
import { addMinutes } from 'date-fns';
import { dropid } from '@/lib/utils';
import { isServiceActive } from '@/lib/services/service-status';
import { Services } from "@/lib/generated/prisma";

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
    // Use the shared transporter
    this.transporter = transporter;
  }

  /**
   * Send an email without saving to database
   * Use this for transactional emails, welcome emails, notifications
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      // Check if EMAIL service is active
      const isActive = await isServiceActive(Services.EMAIL);
      if (!isActive) {
        return { 
          success: false, 
          error: 'Email service is currently inactive' 
        };
      }

      const {
        to,
        subject,
        html,
        text,
        fromEmail = process.env.MAIL_FROM || 'mailby@dropaphi.xyz',
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
   * Initiate OTP verification for an email sender
   */
  async initiateVerification(senderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const sender = await db.emailSender.findUnique({
        where: { id: senderId }
      });

      if (!sender) return { success: false, error: 'Sender not found' };

      // Generate 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save OTP
      await db.senderOTP.create({
        data: {
          id: dropid('eotp'),
          emailSenderId: senderId,
          code,
          expiresAt: addMinutes(new Date(), 15) // 15 mins expiry
        }
      });

      // Send the OTP email
      await this.sendEmail({
        to: sender.email,
        subject: `Verify your email sender: ${sender.email}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Verify your Email Sender</h2>
            <p>You are adding <strong>${sender.email}</strong> as an email sender on DropAphi.</p>
            <p>Please use the following code to verify ownership:</p>
            <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center;">
              ${code}
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          </div>
        `
      });

      return { success: true };
    } catch (error) {
      console.error('[EMAIL_SENDER] Failed to initiate verification:', error);
      return { success: false, error: 'Failed to send verification code' };
    }
  }

  /**
   * Verify an OTP for an email sender
   */
  async verifyOTP(senderId: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const otp = await db.senderOTP.findFirst({
        where: {
          emailSenderId: senderId,
          code,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!otp) return { success: false, error: 'Invalid or expired code' };

      // Mark sender as verified
      await db.emailSender.update({
        where: { id: senderId },
        data: {
          verified: true,
          verifiedAt: new Date()
        }
      });

      // Clean up used/old OTPs
      await db.senderOTP.deleteMany({
        where: { emailSenderId: senderId }
      });

      return { success: true };
    } catch (error) {
      console.error('[EMAIL_SENDER] Failed to verify OTP:', error);
      return { success: false, error: 'Verification failed' };
    }
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