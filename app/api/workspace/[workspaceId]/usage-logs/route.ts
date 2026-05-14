import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError, unauthorized } from "@/lib/respond/response";
import { requireAuth } from "@/lib/auth/auth-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const service = searchParams.get('service');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where: any = { workspaceId };
    if (service && service !== 'all') where.service = service;
    // status is often in metadata for usage logs, but we can filter if needed
    
    const [total, logs] = await Promise.all([
      db.usageLog.count({ where }),
      db.usageLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return ok({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("[WORKSPACE_LOGS_GET]", error);
    return serverError();
  }
}
