// app/api/workspace/[workspaceId]/email/subscriber/[subscriberId]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { ok, unauthorized, serverError } from "@/lib/respond/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; subscriberId: string }> }
) {
  try {
    const { workspaceId, subscriberId } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
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

    if (!member) {
      return unauthorized();
    }

    // Get the subscriber first to get their email
    const subscriber = await db.subscriber.findUnique({
      where: {
        id: subscriberId,
        workspaceId,
      },
      select: {
        email: true,
      },
    });

    if (!subscriber) {
      return ok({ emails: [] });
    }

    // Get emails sent to this subscriber's email address
    const emails = await db.email.findMany({
      where: {
        workspaceId,
        toEmails: {
          has: subscriber.email,
        },
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          }
        },
        trackingEvents: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Format emails for response
    const formattedEmails = emails.map(email => {
      const trackingEvents = email.trackingEvents || [];
      
      return {
        id: email.id,
        subject: email.subject,
        bodyHtml: email.bodyHtml,
        bodyText: email.bodyText,
        status: email.status,
        createdAt: email.createdAt,
        openedAt: email.openedAt,
        clickedAt: email.clickedAt,
        deliveredAt: email.deliveredAt,
        bouncedAt: email.bouncedAt,
        bounceReason: email.bounceReason,
        openCount: email.openCount,
        clickCount: email.clickCount,
        campaign: email.campaign,
        trackingEvents: trackingEvents.map(event => ({
          id: event.id,
          event: event.event,
          url: event.url,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          country: event.country,
          createdAt: event.createdAt,
        })),
      };
    });

    return ok({ emails: formattedEmails });

  } catch (error) {
    console.error("[EMAILS_BY_SUBSCRIBER_ERROR]", error);
    return serverError();
  }
}