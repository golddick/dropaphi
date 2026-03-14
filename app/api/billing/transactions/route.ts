// app/api/billing/transactions/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // Find user's workspace
    const member = await db.workspaceMember.findFirst({
      where: { userId: auth.userId },
      include: {
        workspace: true,
      },
    });

    if (!member) {
      return ok({ 
        transactions: [],
        workspace: null,
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        }
      });
    }

    // Build where clause
    const where: any = { workspaceId: member.workspaceId };
    if (type) where.type = type;
    if (status) where.status = status;

    // Get user's active subscription
    const activeSubscription = await db.workspaceSubscription.findUnique({
      where: { workspaceId: member.workspaceId },
    });

    // Get subscription transactions for this workspace
    const subscriptionTransactions = await db.subscriptionTransaction.findMany({
      where,
      include: {
        subscription: true,
        invoice: {
          include: {
            promoCode: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await db.subscriptionTransaction.count({ where });

    // Get transaction statistics
    const stats = await db.subscriptionTransaction.aggregate({
      where: {
        workspaceId: member.workspaceId,
        status: 'COMPLETED',
      },
      _sum: { amount: true },
      _count: true,
    });

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await db.subscriptionTransaction.count({
      where: {
        workspaceId: member.workspaceId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Get upcoming renewal
    let upcomingRenewal = null;
    if (activeSubscription && activeSubscription.status === 'ACTIVE' && activeSubscription.tier !== 'FREE') {
      upcomingRenewal = {
        date: activeSubscription.currentPeriodEnd,
        amount: activeSubscription.monthlyPrice.toNumber(),
        tier: activeSubscription.tier,
        daysRemaining: Math.ceil(
          (activeSubscription.currentPeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
      };
    }

    // Format transactions for display
    const formatted = subscriptionTransactions.map(t => {
      // Create user-friendly description
      let displayDescription = t.description;
      if (!displayDescription || displayDescription === '') {
        switch (t.type) {
          case 'SUBSCRIPTION_PAYMENT':
            displayDescription = `Payment for ${t.subscription?.tier || ''} plan subscription`;
            break;
          case 'SUBSCRIPTION_RENEWAL':
            displayDescription = `Monthly renewal for ${t.subscription?.tier || ''} plan`;
            break;
          case 'SUBSCRIPTION_UPGRADE':
            displayDescription = `Upgrade to ${t.subscription?.tier || ''} plan`;
            break;
          case 'SUBSCRIPTION_DOWNGRADE':
            displayDescription = `Downgrade subscription`;
            break;
          case 'SUBSCRIPTION_REFUND':
            displayDescription = `Refund for subscription payment`;
            break;
          default:
            displayDescription = `Subscription transaction`;
        }
      }

      // Determine icon and color based on type
      let icon = '💰';
      let color = 'green';
      if (t.type === 'SUBSCRIPTION_REFUND') {
        icon = '↩️';
        color = 'blue';
      } else if (t.type === 'SUBSCRIPTION_UPGRADE') {
        icon = '⬆️';
        color = 'purple';
      } else if (t.type === 'SUBSCRIPTION_DOWNGRADE') {
        icon = '⬇️';
        color = 'orange';
      }

      return {
        id: t.id,
        type: t.type,
        typeDisplay: t.type.replace(/_/g, ' '),
        icon,
        color,
        amount: t.amount.toNumber(),
        description: displayDescription,
        status: t.status,
        statusDisplay: t.status.charAt(0) + t.status.slice(1).toLowerCase(),
        createdAt: t.createdAt.toISOString(),
        createdAtFormatted: new Date(t.createdAt).toLocaleDateString('en-NG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        subscription: t.subscription ? {
          tier: t.subscription.tier,
          status: t.subscription.status,
        } : null,
        invoice: t.invoice ? {
          invoiceNumber: t.invoice.invoiceNumber,
          discount: t.invoice.discount?.toNumber() || 0,
          finalAmount: t.invoice.finalAmount.toNumber(),
          promoCode: t.invoice.promoCode?.code,
        } : null,
        referenceId: t.referenceId,
        metadata: t.metadata,
      };
    });

    // Get transaction summary by type
    const summaryByType = await db.subscriptionTransaction.groupBy({
      by: ['type'],
      where: {
        workspaceId: member.workspaceId,
        status: 'COMPLETED',
      },
      _sum: { amount: true },
      _count: true,
    });

    return ok({
      workspace: {
        id: member.workspace.id,
        name: member.workspace.name,
        email: member.workspace.email,
      },
      subscription: activeSubscription ? {
        id: activeSubscription.id,
        tier: activeSubscription.tier,
        status: activeSubscription.status,
        monthlyPrice: activeSubscription.monthlyPrice.toNumber(),
        currentPeriodStart: activeSubscription.currentPeriodStart.toISOString(),
        currentPeriodEnd: activeSubscription.currentPeriodEnd.toISOString(),
        isActive: activeSubscription.status === 'ACTIVE',
        isFree: activeSubscription.tier === 'FREE',
      } : null,
      upcomingRenewal,
      transactions: formatted,
      stats: {
        totalSpent: stats._sum.amount?.toNumber() || 0,
        totalTransactions: stats._count || 0,
        recentActivity,
        byType: summaryByType.map(item => ({
          type: item.type,
          typeDisplay: item.type.replace(/_/g, ' '),
          count: item._count,
          total: item._sum.amount?.toNumber() || 0,
        })),
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasMore: page < Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("[GET_USER_TRANSACTIONS]", error);
    return serverError();
  }
}