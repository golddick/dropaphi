// lib/email/services/email-sender.service.ts

import nodemailer from "nodemailer";
import { db } from "@/lib/db";

export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
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

  // optional tracking props
  emailId?: string;
  workspaceId?: string;
  campaignId?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  emailId?: string;
}

class EmailSenderService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "mail.thenews.africa",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const {
      to,
      subject,
      cc,
      bcc,
      html,
      text,
      fromEmail = process.env.MAIL_FROM || "noreply@dropaphi.com",
      fromName = process.env.NAME_FROM || "DropAphi",
      replyTo,
      attachments,
      headers,
      emailId,
      workspaceId,
      campaignId,
    } = options;

    const recipients = Array.isArray(to) ? to.join(", ") : to;

    const domain =
      process.env.NEXT_PUBLIC_APP_URL || "https://drop-aphi.vercel.app";

    try {
      let enhancedHTML = html;

      // -------------------------
      // CLICK TRACKING
      // -------------------------
      if (emailId) {
        enhancedHTML = enhancedHTML.replace(
          /href="([^"]+)"/g,
          (_, url) =>
            `href="${domain}/api/track/click?emailId=${emailId}&email=${encodeURIComponent(
              recipients
            )}&url=${encodeURIComponent(url)}"`
        );
      }

      // -------------------------
      // OPEN TRACKING
      // -------------------------
      if (emailId) {
        enhancedHTML += `<img src="${domain}/api/track/open?emailId=${emailId}&email=${encodeURIComponent(
          recipients
        )}" width="1" height="1" style="display:none;" />`;
      }

      // -------------------------
      // FOOTER
      // -------------------------
      enhancedHTML += `
        <div style="text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#666;font-family:Arial,sans-serif;">
          <p>
            © ${new Date().getFullYear()} 
            <a href="https://drop-aphi.vercel.app" style="color:#666;text-decoration:underline;">
              DropAphi
            </a>. All rights reserved.
          </p>

          <p>
            <a href="${domain}/api/unsubscribe?email=${encodeURIComponent(
        recipients
      )}&workspace=${workspaceId || ""}" 
            style="color:#666;text-decoration:underline;">
              Unsubscribe
            </a>
          </p>
        </div>
      `;

      // -------------------------
      // MAIL OPTIONS
      // -------------------------
      const mailOptions: nodemailer.SendMailOptions = {
        from: fromName
          ? `"${fromName}" <${process.env.SMTP_USER}>`
          : fromEmail,
        to: recipients,
        bcc,
        cc,
        subject,
        html: enhancedHTML,
        text: text || this.generatePlainText(html),
        replyTo,
        attachments: attachments?.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
        headers: {
          ...headers,
          "X-Mailer": "DropAphi",
          "List-Unsubscribe": `<${domain}/api/unsubscribe?email=${encodeURIComponent(
            recipients
          )}>`,
        },
      };

      // -------------------------
      // SEND EMAIL
      // -------------------------
      const info = await this.transporter.sendMail(mailOptions);

      console.log(`[EMAIL_SENDER] Email sent: ${info.messageId}`);

      // -------------------------
      // DATABASE UPDATES
      // -------------------------

      if (emailId) {
        await db.email.update({
          where: { id: emailId },
          data: {
            status: "DELIVERED",
            providerRef: info.messageId,
            deliveredAt: new Date(),
          },
        });
      }

      if (workspaceId) {
        await db.workspace.update({
          where: { id: workspaceId },
          data: {
            currentEmailsSent: { increment: 1 },
          },
        });
      }

      if (campaignId) {
        await db.emailCampaign.update({
          where: { id: campaignId },
          data: {
            emailsSent: { increment: 1 },
            lastSentAt: new Date(),
          },
        });
      }

      return {
        success: true,
        messageId: info.messageId,
        emailId,
      };
    } catch (error: any) {
      console.error("[EMAIL_SENDER] Failed to send:", error);

      if (emailId) {
        await db.email.update({
          where: { id: emailId },
          data: {
            status: "FAILED",
            bounceReason: error.message,
          },
        });
      }

      return {
        success: false,
        error: error.message,
        emailId,
      };
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

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
  }

  /**
   * Generate plain text fallback
   */
  private generatePlainText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/g, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .replace(/&nbsp;/g, " ")
      .trim();
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("[EMAIL_SENDER] Transporter verification failed:", error);
      return false;
    }
  }
}

export const mailSender = new EmailSenderService();