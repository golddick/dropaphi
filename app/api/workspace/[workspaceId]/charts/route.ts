import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { ok, unauthorized, notFound, serverError } from "@/lib/respond/response";

export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
   const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const { workspaceId } = params;
    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d

    // Check workspace access
    const membership = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    });

    if (!membership) {
      return notFound("Workspace not found");
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get SMS data
    const smsData = await db.smsMessage.groupBy({
      by: ['createdAt'],
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    // Get Email data
    const emailData = await db.email.groupBy({
      by: ['createdAt'],
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    // Get OTP data
    const otpData = await db.otpRequest.groupBy({
      by: ['createdAt'],
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    // Format data for charts (group by day)
    const chartData = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      chartData.push({
        date: dateStr,
        sms: smsData.filter(d => d.createdAt.toISOString().split('T')[0] === dateStr).length,
        email: emailData.filter(d => d.createdAt.toISOString().split('T')[0] === dateStr).length,
        otp: otpData.filter(d => d.createdAt.toISOString().split('T')[0] === dateStr).length,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return ok({
      period,
      data: chartData,
    });
  } catch (error) {
    console.error("[WORKSPACE_CHARTS]", error);
    return serverError();
  }
}