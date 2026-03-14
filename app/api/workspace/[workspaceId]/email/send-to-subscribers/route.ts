// app/api/workspace/[workspaceId]/email/send-to-subscribers/route.ts
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
// import { mailSender } from "@/lib/email/service/transporter";

// ========================================
// Validation Schema
// ========================================

const sendToSubscribersSchema = z.object({
  campaignId: z.string().optional(),
  templateId: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  html: z.string().min(1, "HTML content is required"),
  text: z.string().optional(),
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
// POST /api/workspace/[workspaceId]/email/send-to-subscribers
// Send email to all workspace subscribers
// ========================================

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
      return forbidden("Insufficient permissions to send emails to subscribers");
    }

    const body = await req.json();
    const parsed = sendToSubscribersSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const {
      subject,
      html,
      text,
      campaignId,
      templateId,
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

    // Get sender details
    const sender = await getWorkspaceSender(workspaceId);

    if (!sender) {
      return err("No sender configured", 400, "NO_SENDER");
    }

    // Get all active subscribers
    const subscribers = await db.subscriber.findMany({
      where: {
        workspaceId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (subscribers.length === 0) {
      return err("No active subscribers found", 404, "NO_SUBSCRIBERS");
    }

    // Check email limit
    if (workspace.currentEmailsSent + subscribers.length > workspace.emailLimit) {
      return err(
        "Email limit exceeded",
        403,
        "LIMIT_EXCEEDED",
        `Used ${workspace.currentEmailsSent}/${workspace.emailLimit} emails. This would send ${subscribers.length} more.`
      );
    }

    // Prepare results
    const results = [];
    const successful = [];
    const failed = [];

    // Send to each subscriber
    for (const subscriber of subscribers) {
      const emailId = dropid("eml");

      try {
        // Personalize content
        let personalizedHtml = html;
        let personalizedText = text || html.replace(/<[^>]*>/g, "");

        // Replace placeholders
        const replacements: Record<string, string> = {
          "{{name}}": subscriber.name || "there",
          "{{email}}": subscriber.email,
          "{{subscriber_id}}": subscriber.id,
          "{{workspace_name}}": workspace.name || "",
          "{{unsubscribe_url}}": `${process.env.NEXTAUTH_URL || "https://app.dropaphi.com"}/unsubscribe?email=${encodeURIComponent(subscriber.email)}&workspace=${workspaceId}`,
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

            toEmails: [subscriber.email],

            subject,
            bodyHtml: personalizedHtml,
            bodyText: personalizedText,

            status: scheduledAt ? "SCHEDULED" : "PENDING",
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,

            metadata: {
              subscriberId: subscriber.id,
              bulkSend: true,
            },
          },
        });

        // If scheduled, don't send now
        if (scheduledAt) {
          successful.push({
            emailId,
            subscriberId: subscriber.id,
            email: subscriber.email,
            status: "scheduled",
          });

          results.push({
            subscriberId: subscriber.id,
            email: subscriber.email,
            success: true,
            emailId,
            status: "scheduled",
          });

          continue;
        }

        // Send email
        const result = await mailSender.sendEmail({
          to: subscriber.email,
          subject,
          html: personalizedHtml,
          text: personalizedText,
          fromEmail: sender.email,
          fromName: sender.name,
          workspaceId:workspaceId,
          campaignId:campaignId,
          headers: {
            "X-Email-ID": emailId,
            "X-Workspace-ID": workspaceId,
            "X-Subscriber-ID": subscriber.id,
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

          // Update workspace count
          await db.workspace.update({
            where: { id: workspaceId },
            data: {
              currentEmailsSent: { increment: 1 },
            },
          });

          successful.push({
            emailId,
            subscriberId: subscriber.id,
            email: subscriber.email,
            messageId: result.messageId,
          });

          results.push({
            subscriberId: subscriber.id,
            email: subscriber.email,
            success: true,
            emailId,
            messageId: result.messageId,
          });
        } else {
          // Update as failed
          await db.email.update({
            where: { id: emailId },
            data: {
              status: "FAILED",
              bounceReason: result.error,
            },
          });

          failed.push({
            emailId,
            subscriberId: subscriber.id,
            email: subscriber.email,
            error: result.error,
          });

          results.push({
            subscriberId: subscriber.id,
            email: subscriber.email,
            success: false,
            emailId,
            error: result.error,
          });
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error: any) {
        console.error(`[SUBSCRIBER_EMAIL] Failed for ${subscriber.email}:`, error);

        // Update email record if it was created
        await db.email.update({
          where: { id: emailId },
          data: {
            status: "FAILED",
            bounceReason: error.message,
          },
        }).catch(() => {}); // Ignore if email record doesn't exist

        failed.push({
          subscriberId: subscriber.id,
          email: subscriber.email,
          error: error.message,
        });

        results.push({
          subscriberId: subscriber.id,
          email: subscriber.email,
          success: false,
          error: error.message,
        });
      }
    }

    // Update campaign stats if campaignId provided
    if (campaignId && successful.length > 0) {
      await db.emailCampaign.update({
        where: { id: campaignId },
        data: {
          emailsSent: { increment: successful.length },
          lastSentAt: new Date(),
        },
      });
    }

    // Return response
    return ok({
      summary: {
        total: subscribers.length,
        successful: successful.length,
        failed: failed.length,
        scheduled: scheduledAt ? subscribers.length : 0,
      },
      results: {
        successful,
        failed,
      },
      message: scheduledAt 
        ? `Email scheduled for ${subscribers.length} subscribers`
        : `Sent to ${successful.length} subscribers, ${failed.length} failed`,
    }, scheduledAt 
        ? `Email scheduled for ${subscribers.length} subscribers`
        : `Sent to ${successful.length} subscribers, ${failed.length} failed`, 202);

  } catch (error) {
    console.error("[SUBSCRIBER_EMAIL_ERROR]", error);
    return serverError(error instanceof Error ? error.message : "Unknown error");
  }
}

// ========================================
// GET /api/workspace/[workspaceId]/email/send-to-subscribers
// Get subscriber email history
// ========================================

export async function GET(
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

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      workspaceId,
      metadata: {
        path: ["bulkSend"],
        equals: true,
      },
    };

    if (campaignId) {
      where.campaignId = campaignId;
    }

    // Get emails
    const [emails, total] = await Promise.all([
      db.email.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        select: {
          id: true,
          toEmails: true,
          subject: true,
          status: true,
          createdAt: true,
          deliveredAt: true,
          openedAt: true,
          clickedAt: true,
          bounceReason: true,
          metadata: true,
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
          template: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      db.email.count({ where }),
    ]);

    return ok({
      emails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[SUBSCRIBER_EMAIL_GET_ERROR]", error);
    return serverError();
  }
}