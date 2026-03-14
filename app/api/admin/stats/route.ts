// app/api/admin/stats/route.ts
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    // Get total subscription transactions count
    const totalTransactions = await db.subscriptionTransaction.count();

    // Get total revenue from completed subscription transactions
    const subscriptionRevenue = await db.subscriptionTransaction.aggregate({
      where: {
        type: 'SUBSCRIPTION_PAYMENT',
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    });

    // Also include renewal transactions in revenue
    const renewalRevenue = await db.subscriptionTransaction.aggregate({
      where: {
        type: 'SUBSCRIPTION_RENEWAL',
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    });

    // Include upgrade transactions (positive amount)
    const upgradeRevenue = await db.subscriptionTransaction.aggregate({
      where: {
        type: 'SUBSCRIPTION_UPGRADE',
        status: 'COMPLETED',
        amount: { gt: 0 },
      },
      _sum: { amount: true },
    });

    // Handle refunds (negative amount)
    const refunds = await db.subscriptionTransaction.aggregate({
      where: {
        type: 'SUBSCRIPTION_REFUND',
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    });

    const totalRevenue = 
      (subscriptionRevenue._sum.amount?.toNumber() || 0) +
      (renewalRevenue._sum.amount?.toNumber() || 0) +
      (upgradeRevenue._sum.amount?.toNumber() || 0) -
      (refunds._sum.amount?.toNumber() || 0);

    // Get subscription stats
    const subscriptionStats = await db.workspaceSubscription.groupBy({
      by: ['tier'],
      _count: true,
      where: {
        status: 'ACTIVE',
      },
    });

    // Get active subscriptions count
    const activeSubscriptions = await db.workspaceSubscription.count({
      where: {
        status: 'ACTIVE',
      },
    });

    // Get total subscriptions (including canceled)
    const totalSubscriptions = await db.workspaceSubscription.count();

    // Get monthly recurring revenue (MRR)
    const mrr = await db.workspaceSubscription.aggregate({
      where: {
        status: 'ACTIVE',
        tier: { not: 'FREE' },
      },
      _sum: { monthlyPrice: true },
    });

    // Get active promo codes count
    const now = new Date();
    const activePromoCodes = await db.promoCode.count({
      where: {
        validFrom: { lte: now },
        validUntil: { gte: now },
        OR: [
          { maxUses: null },
          { usedCount: { lt: db.promoCode.fields.maxUses } },
        ],
      },
    });

    // Get total users
    const totalUsers = await db.user.count();

    // Get total workspaces
    const totalWorkspaces = await db.workspace.count();

    // Get recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await db.subscriptionTransaction.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Get revenue by tier
    const revenueByTier = await db.subscriptionTransaction.groupBy({
      by: ['type'],
      where: {
        status: 'COMPLETED',
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { amount: true },
    });

    // Get pending invoices
    const pendingInvoices = await db.invoice.count({
      where: {
        status: 'PENDING',
      },
    });

    // Get total paid invoices
    const paidInvoices = await db.invoice.count({
      where: {
        status: 'PAID',
      },
    });

    // Get failed invoices
    const failedInvoices = await db.invoice.count({
      where: {
        status: 'FAILED',
      },
    });

    return ok({
      // Transaction stats
      totalTransactions,
      recentTransactions,
      totalRevenue,
      
      // Subscription stats
      activeSubscriptions,
      totalSubscriptions,
      mrr: mrr._sum.monthlyPrice?.toNumber() || 0,
      subscriptionBreakdown: subscriptionStats.map(stat => ({
        tier: stat.tier,
        count: stat._count,
      })),
      
      // Revenue breakdown
      revenueBreakdown: {
        payments: subscriptionRevenue._sum.amount?.toNumber() || 0,
        renewals: renewalRevenue._sum.amount?.toNumber() || 0,
        upgrades: upgradeRevenue._sum.amount?.toNumber() || 0,
        refunds: refunds._sum.amount?.toNumber() || 0,
      },
      
      // Invoice stats
      invoiceStats: {
        pending: pendingInvoices,
        paid: paidInvoices,
        failed: failedInvoices,
      },
      
      // Promo stats
      activePromoCodes,
      
      // User stats
      totalUsers,
      totalWorkspaces,
    });
  } catch (error) {
    console.error("[ADMIN_STATS]", error);
    return serverError();
  }
}