// app/api/workspace/[workspaceId]/email/route.ts

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { z } from "zod";
import { dropid } from "dropid";

import {
  ok,
  err,
  unauthorized,
  forbidden,
  notFound,
  validationError,
  serverError,
  created,
} from "@/lib/respond/response";
import { mailSender } from "@/lib/email/service/transporter";

const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  subject: z.string().min(1),
  html: z.string().min(1),
  text: z.string().optional(),
  campaignId: z.string().optional(),
  templateId: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
});

/**
 * Get workspace sender
 */
async function getWorkspaceSender(workspaceId: string) {
  const sender = await db.emailSender.findFirst({
    where: {
      workspaceId,
      verified: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (sender) {
    return {
      id: sender.id,
      email: sender.email,
      name: sender.name,
    };
  }

  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { email: true, name: true },
  });

  if (!workspace) return null;

  return {
    id: "workspace",
    email: workspace.email || process.env.MAIL_FROM!,
    name: workspace.name || "Workspace",
  };
}

/**
 * POST /api/workspace/[workspaceId]/email
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    });

    if (!member) return unauthorized();

    if (!["OWNER", "ADMIN", "WRITER"].includes(member.role)) {
      return forbidden("Insufficient permissions");
    }

    const body = await req.json();

    const parsed = sendEmailSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const {
      to,
      cc,
      bcc,
      subject,
      html,
      text,
      campaignId,
      templateId,
      scheduledAt,
    } = parsed.data;

    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        emailLimit: true,
        currentEmailsSent: true,
      },
    });

    if (!workspace) return notFound("Workspace not found");

    if (workspace.currentEmailsSent >= workspace.emailLimit) {
      return err(
        "Email limit exceeded",
        403,
        "LIMIT_EXCEEDED",
        `Used ${workspace.currentEmailsSent}/${workspace.emailLimit}`
      );
    }

    const sender = await getWorkspaceSender(workspaceId);

    if (!sender) {
      return err("No sender configured", 400, "NO_SENDER");
    }

    const emailId = dropid("eml");

    const toEmails = Array.isArray(to) ? to : [to];
    const ccEmails = cc ? (Array.isArray(cc) ? cc : [cc]) : [];
    const bccEmails = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [];

    const emailRecord = await db.email.create({
      data: {
        id: emailId,
        workspaceId,
        campaignId,
        templateId,

        emailSenderId: sender.id !== "workspace" ? sender.id : null,

        fromEmail: sender.email,
        fromName: sender.name,

        toEmails,
        ccEmails,
        bccEmails,

        subject,
        bodyHtml: html,
        bodyText: text || html.replace(/<[^>]*>/g, ""),

        status: scheduledAt ? "SCHEDULED" : "PENDING",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    if (scheduledAt) {
      return created({
        emailId,
        messageId: "scheduled",
      });
    }

    const result = await mailSender.sendEmail({
      to: toEmails,
      cc: ccEmails,
      bcc: bccEmails,

      subject,

      html,
      text: text || html.replace(/<[^>]*>/g, ""),

      fromEmail: sender.email,
      fromName: sender.name,
    });

    if (!result.success) {
      await db.email.update({
        where: { id: emailId },
        data: {
          status: "FAILED",
          bounceReason: result.error,
        },
      });

      return serverError(result.error);
    }

    await db.email.update({
      where: { id: emailId },
      data: {
        status: "DELIVERED",
        providerRef: result.messageId,
        deliveredAt: new Date(),
      },
    });

    await db.workspace.update({
      where: { id: workspaceId },
      data: {
        currentEmailsSent: { increment: 1 },
      },
    });

    if (campaignId) {
      await db.emailCampaign.update({
        where: { id: campaignId },
        data: {
          emailsSent: { increment: 1 },
          lastSentAt: new Date(),
        },
      });
    }

    return created({
      emailId,
      messageId: result.messageId,
      recipients: toEmails.length,
    });
  } catch (error) {
    console.error("[EMAIL_SEND_ERROR]", error);
    return serverError();
  }
}