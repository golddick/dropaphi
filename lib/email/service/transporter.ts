// lib/email/services/email-sender.service.ts
import nodemailer from "nodemailer";
import { transporter } from "@/lib/transport";
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
    // Use the shared transporter
    this.transporter = transporter;
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const {
      to,
      subject,
      cc,
      bcc,
      html,
      text,
      fromEmail: requestedFromEmail,
      fromName: requestedFromName,
      replyTo,
      attachments,
      headers,
      emailId,
      workspaceId,
      campaignId,
    } = options;

    // Identity Resolution & Fallback Logic
    const platformDomain = 'dropaphi.xyz';
    const platformSender = `no-reply@${platformDomain}`;
    
    let finalFromEmail = process.env.SMTP_USER || platformSender;
    let finalFromName = requestedFromName || process.env.NAME_FROM || 'DropAphi';
    let finalReplyTo = replyTo || requestedFromEmail;

    if (requestedFromEmail) {
      const domain = requestedFromEmail.split('@')[1];
      
      // Check if there's a verified sender record for this exact email OR the domain
      const sender = await db.emailSender.findFirst({
        where: {
          OR: [
            { email: requestedFromEmail, verified: true },
            { email: domain, isDomain: true, domainVerified: true }
          ]
        }
      });

      if (sender) {
        // Identity is verified (either exact email or entire domain)
        finalFromName = requestedFromName || sender.name;
        finalFromEmail = requestedFromEmail; 
      } else {
        // Fallback to platform domain
        // Requirement: Ensure fallback to workspace name if fromName is missing and domain is unverified.
        let fallbackName = requestedFromName;
        
        if (!fallbackName && workspaceId) {
          const workspace = await db.workspace.findUnique({
            where: { id: workspaceId },
            select: { name: true }
          });
          if (workspace) {
            fallbackName = workspace.name;
          }
        }

        if (!fallbackName) {
          fallbackName = 'User';
        }

        finalFromName = `${fallbackName} via ${platformDomain}`;
        finalFromEmail = platformSender;
        finalReplyTo = requestedFromEmail; // Ensure replies go to the original sender
      }
    }

    const recipients = Array.isArray(to) ? to.join(", ") : to;
    const appDomain = process.env.NEXT_PUBLIC_APP_URL || "https://dropaphi.vercel.app";

    try {
      let enhancedHTML = html;

      // Add tracking (always in production now)
      if (emailId) {
        enhancedHTML = enhancedHTML.replace(
          /href="([^"]+)"/g,
          (_, url) =>
            `href="${appDomain}/api/track/click?emailId=${emailId}&email=${encodeURIComponent(
              recipients
            )}&url=${encodeURIComponent(url)}"`
        );
      }

      if (emailId) {
        enhancedHTML += `<img src="${appDomain}/api/track/open?emailId=${emailId}&email=${encodeURIComponent(
          recipients
        )}" width="1" height="1" style="display:none;" />`;
      }

      // Add footer
      if (!(options as any).skipFooter) {
        enhancedHTML += `
          <div style="text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#666;font-family:Arial,sans-serif;">
            <p>
              © ${new Date().getFullYear()} 
              <a href="https://dropaphi.vercel.app" style="color:#666;text-decoration:underline;">
                DropAphi
              </a>. All rights reserved.
            </p>
            <p>
              <a href="${appDomain}/api/unsubscribe?email=${encodeURIComponent(
          recipients
        )}&workspace=${workspaceId || ""}" 
              style="color:#666;text-decoration:underline;">
                Unsubscribe
              </a>
            </p>
          </div>
        `;
      }

      // Send email
      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${finalFromName}" <${finalFromEmail}>`,
        to: recipients,
        bcc,
        cc,
        subject,
        html: enhancedHTML,
        text: text || this.generatePlainText(html),
        replyTo: finalReplyTo,
        attachments: attachments?.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
        headers: {
          ...headers,
          "X-Mailer": "DropAphi",
          "List-Unsubscribe": `<${appDomain}/api/unsubscribe?email=${encodeURIComponent(recipients)}>`,
        },
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[EMAIL_SENDER] Email sent: ${info.messageId}`);

      // Requirement: Implement database updates for Email and EmailCampaign (sent count) upon successful sending.
      if (emailId) {
        await db.email.update({
          where: { id: emailId },
          data: {
            status: 'SENT',
            deliveredAt: new Date(),
            providerRef: info.messageId,
          }
        });
      }

      if (campaignId) {
        await db.emailCampaign.update({
          where: { id: campaignId },
          data: {
            emailsSent: { increment: 1 },
            lastSentAt: new Date(),
          }
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
            status: 'FAILED',
            metadata: {
              error: error.message
            }
          }
        });
      }

      return {
        success: false,
        error: error.message,
        emailId,
      };
    }
  }

  async sendBatch(emails: EmailOptions[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    for (const email of emails) {
      const result = await this.sendEmail(email);
      results.push(result);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return results;
  }

  private generatePlainText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/g, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .replace(/&nbsp;/g, " ")
      .trim();
  }

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
