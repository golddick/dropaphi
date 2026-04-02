// app/api/workspace/[workspaceId]/email/send-to-subscriber/route.ts
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
} from "@/lib/respond/response";
import { mailSender } from "@/lib/email/service/transporter";

// ========================================
// Validation Schema
// ========================================

const sendToSubscriberSchema = z.object({
  campaignId: z.string().optional(),
  templateId: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  html: z.string().min(1, "HTML content is required"),
  text: z.string().optional(),
  email: z.string().email("Valid email is required"),
  scheduledAt: z.string().datetime().optional(),
});

// ========================================
// Helper to get workspace sender
// ========================================

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

// ========================================
// POST /api/workspace/[workspaceId]/email/send-to-subscriber
// Send email to a single subscriber
// ========================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

    // Authenticate user
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    // Check workspace membership
    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    });

    if (!member) return unauthorized();

    // Check permissions
    if (!["OWNER", "ADMIN", "WRITER"].includes(member.role)) {
      return forbidden("Insufficient permissions to send emails");
    }

    // Parse and validate request body
    const body = await req.json();
    const parsed = sendToSubscriberSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const {
      subject,
      html,
      text,
      campaignId,
      templateId,
      email: recipientEmail,
      scheduledAt,
    } = parsed.data;

    // Get workspace with limits
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        emailLimit: true,
        currentEmailsSent: true,
        name: true,
      },
    });

    if (!workspace) return notFound("Workspace not found");

    // Check if subscriber exists
    const subscriber = await db.subscriber.findFirst({
      where: {
        workspaceId,
        email: recipientEmail,
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
      },
    });

    // Check email limit
    if (workspace.currentEmailsSent + 1 > workspace.emailLimit) {
      return err(
        "Email limit exceeded",
        403,
        "LIMIT_EXCEEDED",
        `Used ${workspace.currentEmailsSent}/${workspace.emailLimit} emails`
      );
    }

    // Get sender details
    const sender = await getWorkspaceSender(workspaceId);

    if (!sender) {
      return err("No sender configured", 400, "NO_SENDER");
    }

    const emailId = dropid("eml");

    // Personalize content
    let personalizedHtml = html;
    let personalizedText = text || html.replace(/<[^>]*>/g, "");

    // Replace placeholders
    const replacements: Record<string, string> = {
      "{{name}}": subscriber?.name || "there",
      "{{email}}": recipientEmail,
      "{{subscriber_id}}": subscriber?.id || "",
      "{{workspace_name}}": workspace.name || "",
      "{{unsubscribe_url}}": `${process.env.NEXTAUTH_URL || "https://app.dropaphi.com"}/unsubscribe?email=${encodeURIComponent(recipientEmail)}&workspace=${workspaceId}`,
    };

    Object.entries(replacements).forEach(([placeholder, value]) => {
      personalizedHtml = personalizedHtml.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), value);
      personalizedText = personalizedText.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), value);
    });

    // Create email record
    const emailRecord = await db.email.create({
      data: {
        id: emailId,
        workspaceId,
        campaignId,
        templateId,
        emailSenderId: sender.id !== "workspace" ? sender.id : null,
        fromEmail: sender.email,
        fromName: sender.name,
        toEmails: [recipientEmail],
        subject,
        bodyHtml: personalizedHtml,
        bodyText: personalizedText,
        status: scheduledAt ? "SCHEDULED" : "PENDING",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        metadata: {
          subscriberId: subscriber?.id,
          singleSend: true,
        },
      },
    });

    // If scheduled, return early
    if (scheduledAt) {
      return ok(
        {
          emailId,
          recipientEmail,
          status: "scheduled",
          scheduledAt,
        },
        "Email scheduled successfully"
      );
    }

    // Send email
    const result = await mailSender.sendEmail({
      to: recipientEmail,
      subject,
      html: personalizedHtml,
      text: personalizedText,
      fromEmail: sender.email,
      fromName: sender.name,
      workspaceId,
      campaignId,
      headers: {
        "X-Email-ID": emailId,
        "X-Workspace-ID": workspaceId,
        "X-Subscriber-ID": subscriber?.id || "",
      },
    });

    if (result.success) {
      // Update email record
      await db.email.update({
        where: { id: emailId },
        data: {
          status: "DELIVERED",
          providerRef: result.messageId,
          deliveredAt: new Date(),
        },
      });

      // Update workspace email count
      await db.workspace.update({
        where: { id: workspaceId },
        data: {
          currentEmailsSent: { increment: 1 },
        },
      });

      // Update campaign stats if campaignId provided
      if (campaignId) {
        await db.emailCampaign.update({
          where: { id: campaignId },
          data: {
            emailsSent: { increment: 1 },
            lastSentAt: new Date(),
          },
        });
      }

      return ok(
        {
          emailId,
          recipientEmail,
          status: "sent",
          messageId: result.messageId,
        },
        `Email sent successfully to ${recipientEmail}`
      );
    } else {
      // Update as failed
      await db.email.update({
        where: { id: emailId },
        data: {
          status: "FAILED",
          bounceReason: result.error,
        },
      });

      return err(
        result.error || "Failed to send email",
        500,
        "SEND_FAILED"
      );
    }
  } catch (error) {
    console.error("[SEND_TO_SUBSCRIBER_ERROR]", error);
    return serverError(error instanceof Error ? error.message : "Unknown error");
  }
}