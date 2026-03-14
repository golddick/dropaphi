
// app/api/billing/subscription/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";
import { dropid } from "dropid";
import { getPlanByTier } from "@/lib/billing/plan";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    console.log('🔍 Fetching subscription for user:', auth.userId);

    // Get user's workspace
    const member = await db.workspaceMember.findFirst({
      where: { userId: auth.userId },
      include: { 
        workspace: {
          select: {
            id: true,
            name: true,
            currentSmsSent: true,
            currentEmailsSent: true,
            currentOtpSent: true,
            currentFilesUsed: true,
            currentSubscribers: true,
            smsLimit: true,
            emailLimit: true,
            otpLimit: true,
            fileLimit: true,
            subscriberLimit: true,
          }
        }
      },
    });

    if (!member) {
      console.log('⚠️ No workspace found for user:', auth.userId);
      return ok({ subscription: null });
    }

    // Get or create subscription
    let subscription = await db.workspaceSubscription.findUnique({
      where: { workspaceId: member.workspaceId },
    });

    if (!subscription) {
      console.log('📝 Creating default FREE subscription for workspace:', member.workspaceId);
      
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      subscription = await db.workspaceSubscription.create({
        data: {
          id: dropid('sub'),
          workspaceId: member.workspaceId,
          tier: 'FREE',
          status: 'ACTIVE',
          monthlyPrice: 0,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
      console.log('✅ Created FREE subscription:', subscription.id);
    }

    // Get plan details for limits
    const plan = getPlanByTier(subscription.tier as any);

    // Return enhanced subscription with workspace data
    return ok({ 
      subscription: {
        id: subscription.id,
        workspaceId: subscription.workspaceId,
        tier: subscription.tier,
        status: subscription.status,
        monthlyPrice: Number(subscription.monthlyPrice),
        currentPeriodStart: subscription.currentPeriodStart.toISOString(),
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        cancelledAt: subscription.cancelledAt?.toISOString() || null,
        paymentRef: subscription.paymentRef,
        createdAt: subscription.createdAt.toISOString(),
        updatedAt: subscription.updatedAt.toISOString(),
        
        // Add limits from plan
        limits: plan ? {
          sms: plan.limits.sms,
          email: plan.limits.email,
          otp: plan.limits.otp,
          storage: plan.limits.storage,
          subscribers: plan.limits.email, // Adjust as needed
        } : null,
        
        // Add usage from workspace
        usage: {
          sms: member.workspace.currentSmsSent || 0,
          email: member.workspace.currentEmailsSent || 0,
          otp: member.workspace.currentOtpSent || 0,
          storage: member.workspace.currentFilesUsed || 0,
          subscribers: member.workspace.currentSubscribers || 0,
        },
      }
    });
  } catch (error) {
    console.error("❌ [GET_SUBSCRIPTION]", error);
    return serverError();
  }
}