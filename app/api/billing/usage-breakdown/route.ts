// app/api/billing/usage-breakdown/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";
import { PLANS } from "@/lib/billing/plan";


export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const member = await db.workspaceMember.findFirst({
      where: { userId: auth.userId },
    });

    if (!member) {
      return ok({ data: [] });
    }

    const subscription = await db.workspaceSubscription.findUnique({
      where: { workspaceId: member.workspaceId },
    });

    const plan = PLANS.find(p => p.tier === subscription?.tier || 'FREE');
    const limits = plan?.apiLimits || { sms: 500, email: 1000, otp: 500, storage: 100 };

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const services = [
      { service: 'SMS', creditsPer: '1 credit/message' },
      { service: 'Email', creditsPer: '0.5 credit/message' },
      { service: 'OTP', creditsPer: '0.75 credit/verification' },
      { service: 'Storage', creditsPer: '0.1 credit/MB' },
    ];

    const usageBreakdown = await Promise.all(
      services.map(async ({ service, creditsPer }) => {
        const usage = await db.usageLog.aggregate({
          where: {
            workspaceId: member.workspaceId,
            service,
            createdAt: { gte: startOfMonth },
          },
          _sum: { creditsUsed: true },
        });

        const used = usage._sum.creditsUsed?.toNumber() || 0;
        const total = limits[service.toLowerCase() as keyof typeof limits] || 1000;
        const percentage = total > 0 ? (used / total) * 100 : 0;

        return {
          service,
          creditsPer,
          used,
          total,
          percentage: Math.min(percentage, 100),
        };
      })
    );

    return ok({ data: usageBreakdown });
  } catch (error) {
    console.error("[GET_USAGE_BREAKDOWN]", error);
    return serverError();
  }
}