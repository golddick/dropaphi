import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError, unauthorized } from "@/lib/respond/response";
import { requireAuth } from "@/lib/auth/auth-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const { workspaceId } = await params;

    const membership = await db.workspaceMember.findFirst({
      where: { workspaceId, userId: auth.userId }
    });

    if (!membership) return unauthorized();

    const [workspace, wallet, usageLogs] = await Promise.all([
      db.workspace.findUnique({
        where: { id: workspaceId },
        include: { subscription: { include: { plan: true } } }
      }),
      db.wallet.findUnique({ where: { workspaceId } }),
      db.usageLog.findMany({
        where: { 
          workspaceId, 
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    if (!workspace) return serverError('Workspace not found');

    // Calculate spend distribution
    const spendByService: Record<string, number> = {};
    usageLogs.forEach(log => {
      const metadata = log.metadata as any;
      if (metadata?.cost) {
        spendByService[log.service] = (spendByService[log.service] || 0) + metadata.cost;
      }
    });

    const topServices = Object.entries(spendByService)
      .map(([service, spend]) => ({ service, spend }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);

    return ok({
      plan: workspace.subscription?.plan || { name: 'Free', tier: 'FREE' },
      balance: wallet?.balance.toNumber() || 0,
      bundleCredits: {
        email: wallet?.emailCredits || 0,
        sms: wallet?.smsCredits || 0,
        otp: wallet?.otpCredits || 0,
        storage: wallet?.storageCredits || 0,
      },
      limits: {
        email: workspace.emailLimit,
        sms: workspace.smsLimit,
        subscribers: workspace.subscriberLimit,
        storage: workspace.fileLimit,
      },
      usage: {
        emailsSent: workspace.currentEmailsSent,
        smsSent: workspace.currentSmsSent,
        subscribers: workspace.currentSubscribers,
        storageUsed: workspace.currentFilesUsed,
      },
      topServices,
      recentLogs: usageLogs.slice(0, 10)
    });
  } catch (error) {
    console.error('[WORKSPACE_BILLING_OVERVIEW]', error);
    return serverError();
  }
}
