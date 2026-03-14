// app/api/admin/transactions/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";
import { requireAdmin } from "@/lib/auth/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Get subscription transactions
    const subscriptionTransactions = await db.subscriptionTransaction.findMany({
      where,
      include: {
        workspace: {
          include: {
            members: {
              where: { role: 'OWNER' },
              include: { user: true },
            },
          },
        },
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

    // Get total counts for pagination
    const totalCount = await db.subscriptionTransaction.count({ where });

    // Format transactions
    const transactions = subscriptionTransactions.map(t => {
      const owner = t.workspace?.members[0]?.user;
      
      // Determine transaction type display
      let typeDisplay = t.type;
      let description = t.description;
      
      // Enhance description based on type if not provided
      if (!description || description === '') {
        switch (t.type) {
          case 'SUBSCRIPTION_PAYMENT':
            description = `Initial subscription payment for ${t.subscription?.tier || 'Unknown'} plan`;
            break;
          case 'SUBSCRIPTION_RENEWAL':
            description = `Monthly renewal for ${t.subscription?.tier || 'Unknown'} plan`;
            break;
          case 'SUBSCRIPTION_UPGRADE':
            description = `Upgrade to ${t.subscription?.tier || 'Unknown'} plan`;
            break;
          case 'SUBSCRIPTION_DOWNGRADE':
            description = `Downgrade subscription`;
            break;
          case 'SUBSCRIPTION_REFUND':
            description = `Refund for subscription payment`;
            break;
          default:
            description = `Subscription transaction`;
        }
      }

      return {
        id: t.id,
        workspaceId: t.workspaceId,
        workspaceName: t.workspace?.name || 'Unknown Workspace',
        userEmail: owner?.email || 'Unknown',
        user: owner ? {
          id: owner.id,
          email: owner.email,
          name: owner.fullName,
        } : null,
        type: t.type,
        typeDisplay: typeDisplay.replace(/_/g, ' '),
        amount: t.amount.toNumber(),
        description: description,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
        subscription: t.subscription ? {
          id: t.subscription.id,
          tier: t.subscription.tier,
          status: t.subscription.status,
        } : null,
        invoice: t.invoice ? {
          id: t.invoice.id,
          invoiceNumber: t.invoice.invoiceNumber,
          discount: t.invoice.discount?.toNumber() || 0,
          finalAmount: t.invoice.finalAmount.toNumber(),
          promoCode: t.invoice.promoCode?.code,
        } : null,
        metadata: t.metadata,
        referenceId: t.referenceId,
      };
    });

    // Calculate totals
    const totalPayments = subscriptionTransactions
      .filter(t => t.type === 'SUBSCRIPTION_PAYMENT' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    const totalRenewals = subscriptionTransactions
      .filter(t => t.type === 'SUBSCRIPTION_RENEWAL' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    const totalUpgrades = subscriptionTransactions
      .filter(t => t.type === 'SUBSCRIPTION_UPGRADE' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    const totalRefunds = subscriptionTransactions
      .filter(t => t.type === 'SUBSCRIPTION_REFUND' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    // Get transaction counts by type
    const countsByType = await db.subscriptionTransaction.groupBy({
      by: ['type'],
      where: {
        status: 'COMPLETED',
      },
      _count: true,
    });

    // Get transaction counts by status
    const countsByStatus = await db.subscriptionTransaction.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get monthly breakdown (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBreakdown = await db.subscriptionTransaction.groupBy({
      by: ['type'],
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: 'COMPLETED',
      },
      _sum: { amount: true },
      _count: true,
    });

    return ok({
      transactions,
      totals: {
        payments: totalPayments,
        renewals: totalRenewals,
        upgrades: totalUpgrades,
        refunds: totalRefunds,
        net: totalPayments + totalRenewals + totalUpgrades - totalRefunds,
      },
      breakdown: {
        byType: countsByType.map(item => ({
          type: item.type,
          count: item._count,
        })),
        byStatus: countsByStatus.map(item => ({
          status: item.status,
          count: item._count,
        })),
        monthly: monthlyBreakdown.map(item => ({
          type: item.type,
          total: item._sum.amount?.toNumber() || 0,
          count: item._count,
        })),
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("[ADMIN_TRANSACTIONS]", error);
    return serverError();
  }
}