
import { dropid } from "dropid";
import { db } from "../db";
import { Services } from "../generated/prisma";

export class BillingService {
  /**
   * Deducts credits for a service usage.
   * Logic:
   * 1. Check monthly limit first (from MonthlyUsage record)
   * 2. If limit reached, deduct from service-specific wallet credits
   * 3. If no service credits, deduct from general wallet balance
   */
  static async deductCredits(workspaceId: string, service: Services, units: number = 1) {
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM

    // 1. Get Workspace with Wallet and Subscription
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        wallet: true,
        subscription: {
          include: { plan: true }
        }
      }
    });

    if (!workspace) throw new Error("Workspace not found");
    if (!workspace.wallet) throw new Error("Wallet not found for workspace");

    // 2. Get current cost for the service
    const serviceCost = await db.serviceCost.findUnique({
      where: { service }
    });

    if (!serviceCost) throw new Error(`Cost not configured for service: ${service}`);

    const costPerUnit = serviceCost.usageRate.toNumber();
    const totalCost = costPerUnit * units;

    // Map service to wallet credit field
    const walletFieldMap: Record<Services, string> = {
      [Services.EMAIL]: 'emailCredits',
      [Services.SMS]: 'smsCredits',
      [Services.OTP]: 'otpCredits',
      [Services.STORAGE]: 'storageCredits',
      [Services.BLOG]: 'blogCredits',
      [Services.PUSH]: 'pushCredits',
      [Services.AI]: 'aiCredits',
      [Services.SUBSCRIBERS]: 'subscribersCredits',
    };

    const walletField = walletFieldMap[service];

    return await db.$transaction(async (tx) => {
      // 3. Get or Create MonthlyUsage for this service
      let monthlyUsage = await tx.monthlyUsage.findUnique({
        where: {
          workspaceId_service_month: {
            workspaceId,
            service,
            month
          }
        }
      });

      if (!monthlyUsage) {
        const limits = this.getServiceLimits(workspace, service);
        monthlyUsage = await tx.monthlyUsage.create({
          data: {
            id: dropid('mus'),
            workspaceId,
            service,
            month,
            subscriberLimit: limits.subscriberLimit,
            emailLimit: limits.emailLimit,
            smsLimit: limits.smsLimit,
            otpLimit: limits.otpLimit,
            storageLimit: limits.storageLimit,
            blogLimit: limits.blogLimit,
            pushLimit: limits.pushLimit,
            aiLimit: limits.aiLimit,
            unitsUsed: 0,
            currentSubscribers: 0,
            currentEmailsSent: 0,
            currentStorageUsed: 0,
            currentSmsSent: 0,
            currentOtpSent: 0,
            currentAiCalls: 0,
            currentBlogsCount: 0,
            currentPushSent: 0,
            topUpUnitsUsed: 0,
            topUpCost: 0,
          }
        });
      }

      // 4. Get current usage and limit for this service
      const { currentUsed, limit } = this.getServiceUsageAndLimit(monthlyUsage, service);
      const remaining = limit - currentUsed;

      // ============================================================
      // STEP 1: Try Monthly Bundle Credits First
      // ============================================================
      if (remaining >= units) {
        await this.updateMonthlyUsage(tx, monthlyUsage.id, service, units, 'increment');
        await this.updateWorkspaceCounter(tx, workspaceId, service, units);
        await this.logUsage(tx, workspaceId, service, units, 0, "BUNDLE");

        return {
          success: true,
          method: "BUNDLE",
          remaining: remaining - units,
          limit,
          used: currentUsed + units,
          message: `Used ${units} ${service} from monthly limit. ${remaining - units} remaining.`
        };
      }

      // ============================================================
      // STEP 2: Try Service-Specific Wallet Credits
      // ============================================================
      const currentServiceCredits = (workspace.wallet as any)[walletField] || 0;
      
      if (currentServiceCredits >= units) {
        // Deduct from service-specific credits
        await tx.wallet.update({
          where: { workspaceId },
          data: {
            [walletField]: { decrement: units }
          }
        });

        await this.updateMonthlyUsage(tx, monthlyUsage.id, service, units, 'increment');
        await this.updateWorkspaceCounter(tx, workspaceId, service, units);
        await this.logUsage(tx, workspaceId, service, units, 0, "SERVICE_CREDITS");

        const remainingCredits = currentServiceCredits - units;

        return {
          success: true,
          method: "SERVICE_CREDITS",
          creditsUsed: units,
          remainingCredits,
          limit,
          used: currentUsed + units,
          message: `Used ${units} ${service} from ${service} credits. ${remainingCredits} ${service} credits remaining.`
        };
      }

      // ============================================================
      // STEP 3: Try General Wallet Balance
      // ============================================================

      // Ensure wallet exists before proceeding
      if (!workspace.wallet) {
        return {
          success: false,
          error: "Wallet not configured for this workspace",
          code: "WALLET_NOT_FOUND",
          limit,
          used: currentUsed,
          required: totalCost,
          serviceCreditsAvailable: currentServiceCredits,
          balanceAvailable: 0,
          suggestion: "Please contact support to set up your wallet."
        };
      }

      const currentBalance = workspace.wallet.balance.toNumber();
      
      if (currentBalance >= totalCost) {
        const updatedWallet = await tx.wallet.update({
          where: { workspaceId },
          data: {
            balance: { decrement: totalCost }
          }
        });

        // Also record as top-up usage in monthly usage
        await tx.monthlyUsage.update({
          where: { id: monthlyUsage.id },
          data: {
            topUpUnitsUsed: { increment: units },
            topUpCost: { increment: totalCost }
          }
        });

        await this.updateMonthlyUsage(tx, monthlyUsage.id, service, units, 'increment');
        await this.updateWorkspaceCounter(tx, workspaceId, service, units);
        await this.logUsage(tx, workspaceId, service, units, totalCost, "BALANCE");

        // Check for auto top-up
        if (workspace.autoTopUpEnabled &&
            updatedWallet.balance.toNumber() < workspace.autoTopUpThreshold.toNumber()) {
          console.log(`[Billing] Triggering auto top-up for ${workspaceId}`);
        }

        return {
          success: true,
          method: "BALANCE",
          cost: totalCost,
          remainingBalance: updatedWallet.balance.toNumber(),
          limit,
          used: currentUsed + units,
          message: `Used ${units} ${service} from wallet balance. Cost: ₦${totalCost}. Remaining balance: ₦${updatedWallet.balance.toNumber()}`
        };
      }

      // ============================================================
      // STEP 4: Grace Period Check
      // ============================================================
      if (workspace.gracePeriodUntil && workspace.gracePeriodUntil > new Date()) {
        await this.updateWorkspaceCounter(tx, workspaceId, service, units);
        await this.logUsage(tx, workspaceId, service, units, totalCost, "GRACE");

        return {
          success: true,
          method: "GRACE",
          pending: true,
          limit,
          used: currentUsed + units,
          message: `Used ${units} ${service} during grace period. Payment required.`
        };
      }

      // ============================================================
      // STEP 5: No Credits Available - Error
      // ============================================================
      const errorMessages: Record<Services, string> = {
        [Services.SUBSCRIBERS]: `Subscriber limit reached. You have ${currentUsed}/${limit} subscribers. No credits available.`,
        [Services.EMAIL]: `Email limit reached. You have sent ${currentUsed}/${limit} emails. No email credits or balance remaining.`,
        [Services.SMS]: `SMS limit reached. You have sent ${currentUsed}/${limit} SMS. No SMS credits or balance remaining.`,
        [Services.OTP]: `OTP limit reached. You have used ${currentUsed}/${limit} OTPs. No OTP credits or balance remaining.`,
        [Services.STORAGE]: `Storage limit reached. You have used ${currentUsed}/${limit} MB. No storage credits or balance remaining.`,
        [Services.BLOG]: `Blog post limit reached. You have ${currentUsed}/${limit} blog posts. No blog credits or balance remaining.`,
        [Services.PUSH]: `Push notification limit reached. You have sent ${currentUsed}/${limit} pushes. No push credits or balance remaining.`,
        [Services.AI]: `AI call limit reached. You have made ${currentUsed}/${limit} AI calls. No AI credits or balance remaining.`,
      };

      return {
        success: false,
        error: errorMessages[service] || `${service} limit reached. No credits available.`,
        code: `${service}_LIMIT_EXCEEDED`,
        limit,
        used: currentUsed,
        required: totalCost,
        serviceCreditsAvailable: currentServiceCredits,
        balanceAvailable: currentBalance,
        suggestion: "Please purchase credits or upgrade your plan."
      };
    });
  }


  // Add this method to your BillingService class

/**
 * Check if a workspace's plan has Dev API access enabled
 * @param workspaceId - The workspace ID
 * @returns boolean - True if Dev API access is enabled, false otherwise
 */
static async hasDevApiAccess(workspaceId: string): Promise<boolean> {
  try {
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        subscription: {
          include: { plan: true }
        }
      }
    });

    if (!workspace) {
      console.error(`[BillingService] Workspace not found: ${workspaceId}`);
      return false;
    }

    // Check if workspace has an active subscription with a plan
    if (!workspace.subscription || !workspace.subscription.plan) {
      // No subscription - check workspace's own devApiAccess flag if it exists
      // Or return false for no plan
      return false;
    }

    // Check the boolean field on the plan model
    // Replace 'devApiAccess' with your actual field name
    const plan = workspace.subscription.plan;
    return plan.devApiAccess === true;
    
  } catch (error) {
    console.error(`[BillingService] Error checking Dev API access:`, error);
    return false;
  }
}


  /**
   * Get service limits from workspace
   */
  private static getServiceLimits(workspace: any, service: Services): any {
    const plan = workspace.subscription?.plan;
    
    switch (service) {
      case Services.SUBSCRIBERS:
        return { subscriberLimit: plan?.subscriberLimit || workspace.subscriberLimit || 0 };
      case Services.EMAIL:
        return { emailLimit: plan?.emailLimit || workspace.emailLimit || 0 };
      case Services.SMS:
        return { smsLimit: plan?.smsLimit || workspace.smsLimit || 0 };
      case Services.OTP:
        return { otpLimit: plan?.otpLimit || workspace.otpLimit || 0 };
      case Services.STORAGE:
        return { storageLimit: plan?.storageLimit || workspace.storageLimit || 0 };
      case Services.BLOG:
        return { blogLimit: plan?.blogLimit || workspace.blogLimit || 0 };
      case Services.PUSH:
        return { pushLimit: plan?.pushLimit || workspace.pushLimit || 0 };
      case Services.AI:
        return { aiLimit: plan?.aiLimit || workspace.aiLimit || 0 };
      default:
        return {};
    }
  }

  /**
   * Get current usage and limit from MonthlyUsage record
   */
  private static getServiceUsageAndLimit(monthlyUsage: any, service: Services): { currentUsed: number; limit: number } {
    switch (service) {
      case Services.SUBSCRIBERS:
        return { currentUsed: monthlyUsage.currentSubscribers || 0, limit: monthlyUsage.subscriberLimit || 0 };
      case Services.EMAIL:
        return { currentUsed: monthlyUsage.currentEmailsSent || 0, limit: monthlyUsage.emailLimit || 0 };
      case Services.SMS:
        return { currentUsed: monthlyUsage.currentSmsSent || 0, limit: monthlyUsage.smsLimit || 0 };
      case Services.OTP:
        return { currentUsed: monthlyUsage.currentOtpSent || 0, limit: monthlyUsage.otpLimit || 0 };
      case Services.STORAGE:
        return { currentUsed: monthlyUsage.currentStorageUsed || 0, limit: monthlyUsage.storageLimit || 0 };
      case Services.BLOG:
        return { currentUsed: monthlyUsage.currentBlogsCount || 0, limit: monthlyUsage.blogLimit || 0 };
      case Services.PUSH:
        return { currentUsed: monthlyUsage.currentPushSent || 0, limit: monthlyUsage.pushLimit || 0 };
      case Services.AI:
        return { currentUsed: monthlyUsage.currentAiCalls || 0, limit: monthlyUsage.aiLimit || 0 };
      default:
        return { currentUsed: 0, limit: 0 };
    }
  }

  /**
   * Update MonthlyUsage counters
   */
  private static async updateMonthlyUsage(tx: any, monthlyUsageId: string, service: Services, units: number, operation: 'increment' | 'decrement') {
    const updateData: any = {};

    switch (service) {
      case Services.SUBSCRIBERS:
        updateData.currentSubscribers = { [operation]: units };
        updateData.unitsUsed = { [operation]: units };
        break;
      case Services.EMAIL:
        updateData.currentEmailsSent = { [operation]: units };
        updateData.unitsUsed = { [operation]: units };
        break;
      case Services.SMS:
        updateData.currentSmsSent = { [operation]: units };
        updateData.unitsUsed = { [operation]: units };
        break;
      case Services.OTP:
        updateData.currentOtpSent = { [operation]: units };
        updateData.unitsUsed = { [operation]: units };
        break;
      case Services.STORAGE:
        updateData.currentStorageUsed = { [operation]: units };
        updateData.unitsUsed = { [operation]: units };
        break;
      case Services.BLOG:
        updateData.currentBlogsCount = { [operation]: units };
        updateData.unitsUsed = { [operation]: units };
        break;
      case Services.PUSH:
        updateData.currentPushSent = { [operation]: units };
        updateData.unitsUsed = { [operation]: units };
        break;
      case Services.AI:
        updateData.currentAiCalls = { [operation]: units };
        updateData.unitsUsed = { [operation]: units };
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await tx.monthlyUsage.update({
        where: { id: monthlyUsageId },
        data: updateData
      });
    }
  }

  /**
   * Update workspace counter
   */
  private static async updateWorkspaceCounter(tx: any, workspaceId: string, service: Services, units: number) {
    const updateData: any = {};

    switch (service) {
      case Services.SUBSCRIBERS:
        updateData.currentSubscribers = { increment: units };
        break;
      case Services.EMAIL:
        updateData.currentEmailsSent = { increment: units };
        break;
      case Services.SMS:
        updateData.currentSmsSent = { increment: units };
        break;
      case Services.OTP:
        updateData.currentOtpSent = { increment: units };
        break;
      case Services.STORAGE:
        updateData.currentStorageUsed = { increment: units };
        break;
      case Services.BLOG:
        updateData.currentBlogsCount = { increment: units };
        break;
      case Services.PUSH:
        updateData.currentPushSent = { increment: units };
        break;
      case Services.AI:
        updateData.currentAiCalls = { increment: units };
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await tx.workspace.update({
        where: { id: workspaceId },
        data: updateData
      });
    }
  }

  /**
   * Log usage for audit trail
   */
  private static async logUsage(tx: any, workspaceId: string, service: Services, units: number, cost: number, method: string) {
    const month = new Date().toISOString().slice(0, 7);

    await tx.usageLog.create({
      data: {
        id: dropid('ulg'),
        workspaceId,
        service: service.toString(),
        month,
        currentSubscribers: 0,
        currentEmailsSent: 0,
        currentFilesUsed: 0,
        currentSmsSent: 0,
        currentOtpSent: 0,
        currentApiCalls: 0,
        currentBlogsCount: 0,
        currentPushSent: 0,
        metadata: {
          units,
          cost,
          method,
          timestamp: new Date().toISOString()
        }
      }
    });
  }

  /**
   * Check limits without deducting (for UI preview)
   */
  static async checkLimit(workspaceId: string, service: Services, units: number = 1): Promise<{
    success: boolean;
    remaining: number;
    limit: number;
    used: number;
    serviceCreditsAvailable: number;
    balanceAvailable: number;
    canUseServiceCredits: boolean;
    canUseBalance: boolean;
  }> {
    const month = new Date().toISOString().slice(0, 7);

    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        wallet: true,
        subscription: { include: { plan: true } }
      }
    });

    if (!workspace || !workspace.wallet) {
      return { 
        success: false, 
        remaining: 0, 
        limit: 0, 
        used: 0,
        serviceCreditsAvailable: 0,
        balanceAvailable: 0,
        canUseServiceCredits: false,
        canUseBalance: false
      };
    }

    const walletFieldMap: Record<Services, string> = {
      [Services.EMAIL]: 'emailCredits',
      [Services.SMS]: 'smsCredits',
      [Services.OTP]: 'otpCredits',
      [Services.STORAGE]: 'storageCredits',
      [Services.BLOG]: 'blogCredits',
      [Services.PUSH]: 'pushCredits',
      [Services.AI]: 'aiCredits',
      [Services.SUBSCRIBERS]: 'subscribersCredits',
    };

    const walletField = walletFieldMap[service];
    const serviceCredits = (workspace.wallet as any)[walletField] || 0;
    const balanceAvailable = workspace.wallet.balance.toNumber();

    let monthlyUsage = await db.monthlyUsage.findUnique({
      where: {
        workspaceId_service_month: {
          workspaceId,
          service,
          month
        }
      }
    });

    if (!monthlyUsage) {
      const limits = this.getServiceLimits(workspace, service);
      const limit = this.getLimitValue(limits, service);
      
      return {
        success: true,
        remaining: limit,
        limit,
        used: 0,
        serviceCreditsAvailable: serviceCredits,
        balanceAvailable,
        canUseServiceCredits: serviceCredits > 0,
        canUseBalance: balanceAvailable > 0
      };
    }

    const { currentUsed, limit } = this.getServiceUsageAndLimit(monthlyUsage, service);
    const monthlyRemaining = limit - currentUsed;

    if (monthlyRemaining >= units) {
      return {
        success: true,
        remaining: monthlyRemaining,
        limit,
        used: currentUsed,
        serviceCreditsAvailable: serviceCredits,
        balanceAvailable,
        canUseServiceCredits: true,
        canUseBalance: true
      };
    }

    // Check if service credits can cover
    if (serviceCredits >= units) {
      return {
        success: true,
        remaining: serviceCredits,
        limit,
        used: currentUsed,
        serviceCreditsAvailable: serviceCredits,
        balanceAvailable,
        canUseServiceCredits: true,
        canUseBalance: true
      };
    }

    // Check if balance can cover
    const serviceCost = await db.serviceCost.findUnique({ where: { service } });
    if (serviceCost) {
      const costPerUnit = serviceCost.usageRate.toNumber();
      const totalCost = costPerUnit * units;
      
      if (balanceAvailable >= totalCost) {
        return {
          success: true,
          remaining: Math.floor(balanceAvailable / costPerUnit),
          limit,
          used: currentUsed,
          serviceCreditsAvailable: serviceCredits,
          balanceAvailable,
          canUseServiceCredits: false,
          canUseBalance: true
        };
      }
    }

    return {
      success: false,
      remaining: 0,
      limit,
      used: currentUsed,
      serviceCreditsAvailable: serviceCredits,
      balanceAvailable,
      canUseServiceCredits: false,
      canUseBalance: false
    };
  }

  private static getLimitValue(limits: any, service: Services): number {
    switch (service) {
      case Services.SUBSCRIBERS: return limits.subscriberLimit || 0;
      case Services.EMAIL: return limits.emailLimit || 0;
      case Services.SMS: return limits.smsLimit || 0;
      case Services.OTP: return limits.otpLimit || 0;
      case Services.STORAGE: return limits.storageLimit || 0;
      case Services.BLOG: return limits.blogLimit || 0;
      case Services.PUSH: return limits.pushLimit || 0;
      case Services.AI: return limits.aiLimit || 0;
      default: return 0;
    }
  }
}