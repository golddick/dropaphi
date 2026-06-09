// lib/v1-api/email/OtpTransporter.ts

import nodemailer from "nodemailer";
import { transporter } from "@/lib/inAppTransporter/transport";
import { db } from "@/lib/db";

export interface OTPEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromEmail?: string;
  fromName?: string;
  workspaceId?: string;
  headers?: Record<string, string>;
  replyTo?: string;
  skipFooter?: boolean;
}

export interface OTPEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class OTPTransportService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = transporter;
  }

  async sendEmail(options: OTPEmailOptions): Promise<OTPEmailResult> {
    try {
      const {
        to,
        subject,
        html,
        text,
        fromEmail: requestedFromEmail,
        fromName: requestedFromName,
        workspaceId,
        headers,
        replyTo,
      } = options;

      const platformSender =
        process.env.MAIL_FROM || "mailby@dropaphi.xyz";

      let finalFromEmail = platformSender;
      let finalFromName = requestedFromName || "DropAphi";
      let finalReplyTo = replyTo || requestedFromEmail;

      if (requestedFromEmail) {
        const domain = requestedFromEmail.split("@")[1];

        const sender = await db.emailSender.findFirst({
          where: {
            OR: [
              {
                email: requestedFromEmail,
                verified: true,
              },
              {
                email: domain,
                isDomain: true,
                domainVerified: true,
              },
            ],
          },
        });

        if (sender) {
          finalFromEmail = requestedFromEmail;
          finalFromName = requestedFromName || sender.name;
        } else {
          if (workspaceId) {
            const workspace = await db.workspace.findUnique({
              where: { id: workspaceId },
              select: { name: true },
            });

            if (workspace) {
              finalFromName = workspace.name;
            }
          }
        }
      }

      const info = await this.transporter.sendMail({
        from: `"${finalFromName}" <${finalFromEmail}>`,
        to,
        subject,
        html,
        text: text || this.generatePlainText(html),
        replyTo: finalReplyTo,
        headers: {
          ...headers,
          "X-Mailer": "DropAphi OTP Service",
        },
      });

      console.log(
        `[OTP_TRANSPORTER] OTP sent successfully: ${info.messageId}`
      );

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error(
        "[OTP_TRANSPORTER] Failed to send OTP:",
        error
      );

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      };
    }
  }

  private generatePlainText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/g, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error(
        "[OTP_TRANSPORTER] Verification failed:",
        error
      );
      return false;
    }
  }
}

export const emailSender = new OTPTransportService();