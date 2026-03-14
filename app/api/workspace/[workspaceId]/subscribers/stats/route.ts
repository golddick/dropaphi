


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
    
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    });

    if (!member) {
      return unauthorized();
    }

    // Get counts by status
    const [total, active, unsubscribed, bounced] = await Promise.all([
      db.subscriber.count({ where: { workspaceId } }),
      db.subscriber.count({ where: { workspaceId, status: 'ACTIVE' } }),
      db.subscriber.count({ where: { workspaceId, status: 'UNSUBSCRIBED' } }),
      db.subscriber.count({ where: { workspaceId, status: 'BOUNCED' } }),
    ]);

    return ok({
      stats: {
        total,
        active,
        unsubscribed,
        bounced,
      },
    });

  } catch (error) {
    console.error("[SUBSCRIBER_STATS_ERROR]", error);
    return serverError();
  }
}