// app/api/billing/usage-breakdown/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    // Get user's workspace
    const member = await db.workspaceMember.findFirst({
      where: { userId: auth.userId },
      include: {
        workspace: true,
      },
    });

    if (!member) {
      return ok({ usage: [] });
    }

    const workspace = member.workspace;
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Get monthly usage record for this workspace and month
    const monthlyUsage = await db.monthlyUsage.findMany({
      where: {
        workspaceId: workspace.id,
        month: currentMonth,
      },
    });

    // Create a map for quick lookup
    const usageMap = new Map();
    monthlyUsage.forEach(usage => {
      usageMap.set(usage.service, usage);
    });

    // Service configuration mapping to workspace fields
    const services = [
      { 
        name: 'Subscribers',
        service: 'SUBSCRIBERS',
        limit: workspace.subscriberLimit,
        used: workspace.currentSubscribers,
        unit: 'subscribers'
      },
      { 
        name: 'Email',
        service: 'EMAIL',
        limit: workspace.emailLimit,
        used: workspace.currentEmailsSent,
        unit: 'emails'
      },
      { 
        name: 'SMS',
        service: 'SMS',
        limit: workspace.smsLimit,
        used: workspace.currentSmsSent,
        unit: 'messages'
      },
      { 
        name: 'OTP',
        service: 'OTP',
        limit: workspace.otpLimit,
        used: workspace.currentOtpSent,
        unit: 'verifications'
      },
      { 
        name: 'Blog',
        service: 'BLOG',
        limit: workspace.blogLimit,
        used: workspace.currentBlogsCount,
        unit: 'posts'
      },
      { 
        name: 'Push',
        service: 'PUSH',
        limit: workspace.pushLimit,
        used: workspace.currentPushSent,
        unit: 'notifications'
      },
      { 
        name: 'AI',
        service: 'AI',
        limit: workspace.aiLimit,
        used: workspace.currentAiCalls,
        unit: 'calls'
      },
      { 
        name: 'Storage',
        service: 'STORAGE',
        limit: workspace.storageLimit,
        used: workspace.currentStorageUsed,
        unit: 'MB',
        isFloat: true
      }
    ];

    // Build usage breakdown
    const usageBreakdown = services.map(service => {
      const monthly = usageMap.get(service.service);
      const used = service.isFloat ? service.used : Math.floor(service.used);
      const limit = service.limit;
      const percentage = limit > 0 ? (used / limit) * 100 : 0;
      
      return {
        service: service.name,
        serviceKey: service.service,
        used: used,
        usedFormatted: service.isFloat 
          ? `${used.toFixed(2)} ${service.unit}`
          : `${used} ${service.unit}`,
        limit: limit,
        limitFormatted: service.isFloat
          ? `${limit} ${service.unit}`
          : `${limit} ${service.unit}`,
        percentage: Math.min(Math.round(percentage), 100),
        remaining: Math.max(0, limit - used),
        remainingFormatted: service.isFloat
          ? `${Math.max(0, limit - used).toFixed(2)} ${service.unit}`
          : `${Math.max(0, limit - used)} ${service.unit}`,
        isOverLimit: used > limit,
        topUpUnitsUsed: monthly?.topUpUnitsUsed || 0,
        topUpCost: monthly ? Number(monthly.topUpCost) : 0,
        unitsUsed: monthly?.unitsUsed || 0,
      };
    });

    // Calculate summary
    const summary = {
      totalUsed: usageBreakdown.reduce((sum, s) => sum + s.used, 0),
      totalLimit: usageBreakdown.reduce((sum, s) => sum + s.limit, 0),
      totalPercentage: 0,
      month: currentMonth,
    };
    
    summary.totalPercentage = summary.totalLimit > 0 
      ? (summary.totalUsed / summary.totalLimit) * 100 
      : 0;

    // Get wallet balance
    const wallet = await db.wallet.findUnique({
      where: { workspaceId: workspace.id },
    });

    return ok({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        plan: workspace.plan,
      },
      currentPeriod: {
        month: currentMonth,
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      },
      usage: usageBreakdown,
      summary: {
        ...summary,
        totalPercentage: Math.min(Math.round(summary.totalPercentage), 100),
        walletBalance: wallet ? Number(wallet.balance) : 0,
      },
    });

  } catch (error) {
    console.error("[GET_USAGE_BREAKDOWN]", error);
    return serverError();
  }
}