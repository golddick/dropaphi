
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
            currentBlogsCount: true,
            currentPushSent: true,
            currentApiCalls: true,
            smsLimit: true,
            emailLimit: true,
            otpLimit: true,
            fileLimit: true,
            subscriberLimit: true,
            blogLimit: true,
            pushLimit: true,
            apiLimit: true,
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

    // Get wallet for credits
    const wallet = await db.wallet.findUnique({
      where: { workspaceId: member.workspaceId },
    });

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
        
        // Add limits from plan/workspace
        limits: {
          sms: member.workspace.smsLimit,
          email: member.workspace.emailLimit,
          otp: member.workspace.otpLimit,
          storage: member.workspace.fileLimit,
          subscribers: member.workspace.subscriberLimit,
          blog: member.workspace.blogLimit,
          push: member.workspace.pushLimit,
          api: member.workspace.apiLimit,
        },
        
        // Add usage from workspace
        usage: {
          sms: member.workspace.currentSmsSent || 0,
          email: member.workspace.currentEmailsSent || 0,
          otp: member.workspace.currentOtpSent || 0,
          storage: member.workspace.currentFilesUsed || 0,
          subscribers: member.workspace.currentSubscribers || 0,
          blog: member.workspace.currentBlogsCount || 0,
          push: member.workspace.currentPushSent || 0,
          api: member.workspace.currentApiCalls || 0,
        },

        // Add wallet credits
        credits: {
          sms: wallet?.smsCredits || 0,
          email: wallet?.emailCredits || 0,
          otp: wallet?.otpCredits || 0,
          storage: wallet?.storageCredits || 0,
          subscribers: 0, // subscribers typically don't have credits
          blog: wallet?.blogCredits || 0,
          push: wallet?.pushCredits || 0,
          api: wallet?.apiCredits || 0,
        },
        balance: wallet?.balance ? Number(wallet.balance) : 0
      }
    });
  } catch (error) {
    console.error("❌ [GET_SUBSCRIPTION]", error);
    return serverError();
  }
}