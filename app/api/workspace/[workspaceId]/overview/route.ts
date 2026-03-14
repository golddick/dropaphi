import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { ok, unauthorized, notFound, serverError, err } from "@/lib/respond/response";

export async function GET(
  req: NextRequest,
 { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const { workspaceId } = await params;

    if (!workspaceId){
        err('no workspace id')
    }

    // Check if user has access to this workspace
    const membership = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
      include: {
        workspace: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!membership) {
      return notFound("Workspace not found or access denied");
    }

    const workspace = membership.workspace;

    // Get current month's usage stats
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Get usage logs for current month
    const usageLog = await db.usageLog.findFirst({
      where: {
        workspaceId,
        month: currentMonth,
      },
    });

    // Get recent SMS messages
    const recentSms = await db.smsMessage.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        recipient: true,
        message: true,
        status: true,
        createdAt: true,
      },
    });

    // Get recent emails
    const recentEmails = await db.email.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        subject: true,
        toEmails: true,
        status: true,
        createdAt: true,
      },
    });

    // Get OTP stats
    const otpStats = await db.otpRequest.aggregate({
      where: {
        workspaceId,
        createdAt: {
          gte: new Date(new Date().setDate(1)), // First day of current month
        },
      },
      _count: true,
    });

    // Get file storage usage
    const fileStats = await db.file.aggregate({
      where: { workspaceId },
      _sum: { size: true },
      _count: true,
    });

    // Get API key count
    const apiKeyCount = await db.apiKey.count({
      where: { workspaceId },
    });

    // Calculate usage percentages
    const usage = {
      sms: {
        used: workspace.currentSmsSent,
        limit: workspace.smsLimit,
        percentage: Math.min(Math.round((workspace.currentSmsSent / workspace.smsLimit) * 100), 100),
      },
      email: {
        used: workspace.currentEmailsSent,
        limit: workspace.emailLimit,
        percentage: Math.min(Math.round((workspace.currentEmailsSent / workspace.emailLimit) * 100), 100),
      },
      otp: {
        used: workspace.currentOtpSent,
        limit: workspace.otpLimit,
        percentage: Math.min(Math.round((workspace.currentOtpSent / workspace.otpLimit) * 100), 100),
      },
      storage: {
        used: Math.round(workspace.currentFilesUsed / 1024), // Convert to MB
        limit: workspace.fileLimit,
        percentage: Math.min(Math.round((workspace.currentFilesUsed / workspace.fileLimit) * 100), 100),
      },
      subscribers: {
        used: workspace.currentSubscribers,
        limit: workspace.subscriberLimit,
        percentage: Math.min(Math.round((workspace.currentSubscribers / workspace.subscriberLimit) * 100), 100),
      },
    };

    // Get success rates
    const smsSuccess = await db.smsMessage.count({
      where: {
        workspaceId,
        status: 'DELIVERED',
        createdAt: {
          gte: new Date(new Date().setDate(1)),
        },
      },
    });

    const smsTotal = await db.smsMessage.count({
      where: {
        workspaceId,
        createdAt: {
          gte: new Date(new Date().setDate(1)),
        },
      },
    });

    const emailSuccess = await db.email.count({
      where: {
        workspaceId,
        status: 'DELIVERED',
        deliveredAt: {
          not: null,
        },
        createdAt: {
          gte: new Date(new Date().setDate(1)),
        },
      },
    });

    const emailTotal = await db.email.count({
      where: {
        workspaceId,
        createdAt: {
          gte: new Date(new Date().setDate(1)),
        },
      },
    });

    const otpSuccess = await db.otpRequest.count({
      where: {
        workspaceId,
        // status: 'VERIFIED',
        createdAt: {
          gte: new Date(new Date().setDate(1)),
        },
      },
    });

    return ok({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        plan: workspace.plan,
        createdAt: workspace.createdAt,
        role: membership.role,
      },
      limits: {
        sms: workspace.smsLimit,
        email: workspace.emailLimit,
        otp: workspace.otpLimit,
        storage: workspace.fileLimit,
        subscribers: workspace.subscriberLimit,
      },
      usage,
      stats: {
        total: {
          sms: workspace.currentSmsSent,
          email: workspace.currentEmailsSent,
          otp: workspace.currentOtpSent,
          files: fileStats._count || 0,
          storage: Number(fileStats._sum?.size || 0),
          subscribers: workspace.currentSubscribers,
          apiKeys: apiKeyCount,
        },
        monthly: {
          sms: workspace.currentSmsSent,
          email: workspace.currentEmailsSent,
          otp: workspace.currentOtpSent,
        },
        success: {
          sms: smsTotal > 0 ? Math.round((smsSuccess / smsTotal) * 100) : 0,
          email: emailTotal > 0 ? Math.round((emailSuccess / emailTotal) * 100) : 0,
          otp: workspace.currentOtpSent > 0 ? Math.round((otpSuccess / workspace.currentOtpSent) * 100) : 0,
        },
      },
      recent: {
        sms: recentSms.map(s => ({
          id: s.id,
          recipient: s.recipient,
          message: s.message.length > 50 ? s.message.substring(0, 50) + '...' : s.message,
          status: s.status.toLowerCase(),
          createdAt: s.createdAt.toISOString(),
        })),
        emails: recentEmails.map(e => ({
          id: e.id,
          subject: e.subject,
          to: e.toEmails[0],
          status: e.status.toLowerCase(),
          createdAt: e.createdAt.toISOString(),
        })),
      },
      subscription: workspace.subscription ? {
        tier: workspace.subscription.tier,
        status: workspace.subscription.status,
        currentPeriodEnd: workspace.subscription.currentPeriodEnd,
        monthlyPrice: workspace.subscription.monthlyPrice.toNumber(),
      } : null,
    });
  } catch (error) {
    console.error("[WORKSPACE_OVERVIEW]", error);
    return serverError();
  }
}