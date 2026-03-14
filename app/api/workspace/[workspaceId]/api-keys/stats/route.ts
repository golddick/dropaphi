// app/api/workspace/[workspaceId]/api-keys/stats/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { ok, err, serverError } from "@/lib/respond/response";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ workspaceId: string }> } 
) {
    console.log("=== GET API KEYS HIT ===", req.url);
      console.log("=== GET API KEYS HIT params ===", context.params);
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const { workspaceId } = await context.params;

    // Verify access
    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    });

    if (!member) {
      return err("Unauthorized", 403);
    }

    // Get key statistics
    const [totalKeys, activeKeys, liveKeys, testKeys, usageStats] = await Promise.all([
      db.apiKey.count({ where: { workspaceId } }),
      db.apiKey.count({ where: { workspaceId, status: 'ACTIVE' } }),
      db.apiKey.count({ where: { workspaceId, keyPrefix: 'da_live_' } }),
      db.apiKey.count({ where: { workspaceId, keyPrefix: 'da_test_' } }),
      db.aPiUsageSummary.aggregate({
        where: {
          workspaceId,
          date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _sum: { totalCalls: true },
      }),
    ]);

    const totalCalls = usageStats._sum.totalCalls || 0;
    const averageCallsPerDay = Math.round(totalCalls / 30);

    return ok({
      stats: {
        totalKeys,
        activeKeys,
        liveKeys,
        testKeys,
        totalCalls,
        averageCallsPerDay,
      },
    });
  } catch (error) {
    console.error("[API_KEY_STATS]", error);
    return serverError();
  }
}