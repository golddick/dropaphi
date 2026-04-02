// app/api/workspace/[workspaceId]/subscribers/stats/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { ok, unauthorized, serverError } from "@/lib/respond/response";

export async function GET(
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

    if (!member) {
      return unauthorized();
    }

    // Get subscriber stats
    const [total, active, unsubscribed, bounced] = await Promise.all([
      db.subscriber.count({
        where: { workspaceId },
      }),
      db.subscriber.count({
        where: { workspaceId, status: "ACTIVE" },
      }),
      db.subscriber.count({
        where: { workspaceId, status: "UNSUBSCRIBED" },
      }),
      db.subscriber.count({
        where: { workspaceId, status: "BOUNCED" },
      }),
    ]);

    // Get email stats for this workspace
    const [emailsSent, emailsOpened, emailsClicked] = await Promise.all([
      db.email.count({ where: { workspaceId } }),
      db.email.count({ where: { workspaceId, openedAt: { not: null } } }),
      db.email.count({ where: { workspaceId, clickedAt: { not: null } } }),
    ]);

    const stats = {
      total,
      active,
      unsubscribed,
      bounced,
      emailsSent,
      emailsOpened,
      emailsClicked,
      openRate: emailsSent > 0 ? (emailsOpened / emailsSent) * 100 : 0,
      clickRate: emailsSent > 0 ? (emailsClicked / emailsSent) * 100 : 0,
    };

    return ok(stats);
  } catch (error) {
    console.error("[SUBSCRIBER_STATS_ERROR]", error);
    return serverError();
  }
}