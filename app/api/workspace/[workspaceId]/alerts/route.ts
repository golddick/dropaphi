import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { ok, serverError, notFound } from "@/lib/respond/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const { workspaceId } = await params;

    const alerts = await db.workspaceAlert.findMany({
      where: {
        workspaceId,
        dismissedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return ok(alerts);
  } catch (error) {
    console.error('[WORKSPACE_ALERTS_GET]', error);
    return serverError('Failed to fetch alerts');
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const { alertId } = body;

    const alert = await db.workspaceAlert.update({
      where: { id: alertId },
      data: { dismissedAt: new Date() }
    });

    return ok(alert);
  } catch (error) {
    console.error('[WORKSPACE_ALERTS_PATCH]', error);
    return serverError('Failed to dismiss alert');
  }
}
