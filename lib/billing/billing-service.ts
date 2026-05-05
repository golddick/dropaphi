import { db } from "../db";
import { dropid } from "../utils";
import { Services } from "../generated/prisma";

export class BillingService {
  /**
   * Deducts credits for a service usage.
   * Logic:
   * 1. Check monthly bundle credits first (via MonthlyUsage)
   * 2. If reach limit, deduct from top-up wallet balance based on ServiceCost
   * This works for ALL services including SUBSCRIBERS, BLOG, etc.
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

    // 2. Get current cost for the service
    const serviceCost = await db.serviceCost.findUnique({
      where: { service }
    });

    if (!serviceCost) throw new Error(`Cost not configured for service: ${service}`);

    // Use usageRate for deduction from wallet
    const totalCost = serviceCost.usageRate.toNumber() * units;

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
        // Initialize monthly usage from plan if available
        const bundleLimit = this.getPlanBundleLimit(workspace, service);
        monthlyUsage = await tx.monthlyUsage.create({
          data: {
            id: dropid('mus'),
            workspaceId,
            service,
            month,
            bundleLimit
          }
        });
      }

      const bundleRemaining = monthlyUsage.bundleLimit - monthlyUsage.unitsUsed;

      // 4. Try Bundle Credits First (works for ALL services)
      if (bundleRemaining >= units) {
        await tx.monthlyUsage.update({
          where: { id: monthlyUsage.id },
          data: {
            unitsUsed: { increment: units }
          }
        });

        // Update workspace counter
        await this.updateWorkspaceCounter(tx, workspaceId, service, units);

        // Log usage
        await this.logUsage(tx, workspaceId, service, units, 0, "BUNDLE");

        return {
          success: true,
          method: "BUNDLE",
          remaining: bundleRemaining - units,
          message: `Used ${units} ${service} from bundle. ${bundleRemaining - units} remaining.`
        };
      }

      // 5. If bundle exhausted, check Top-Up Balance (works for ALL services)
      if (workspace.wallet && workspace.wallet.balance.toNumber() >= totalCost) {
        const updatedWallet = await tx.wallet.update({
          where: { workspaceId },
          data: {
            balance: { decrement: totalCost }
          }
        });

        await tx.monthlyUsage.update({
          where: { id: monthlyUsage.id },
          data: {
            topUpUnitsUsed: { increment: units },
            topUpCost: { increment: totalCost }
          }
        });

        // Update workspace counter
        await this.updateWorkspaceCounter(tx, workspaceId, service, units);

        // Log usage
        await this.logUsage(tx, workspaceId, service, units, totalCost, "TOP_UP");

        // Check for auto top-up
        if (workspace.autoTopUpEnabled &&
            updatedWallet.balance.toNumber() < workspace.autoTopUpThreshold.toNumber()) {
          console.log(`[Billing] Triggering auto top-up for ${workspaceId}`);
        }

        return {
          success: true,
          method: "TOP_UP",
          cost: totalCost,
          remainingBalance: updatedWallet.balance.toNumber(),
          message: `Used ${units} ${service} from wallet. Cost: ${totalCost}. Remaining balance: ${updatedWallet.balance.toNumber()}`
        };
      }

      // 6. Grace Mode check (works for ALL services)
      if (workspace.gracePeriodUntil && workspace.gracePeriodUntil > new Date()) {
        // Update workspace counter even in grace period
        await this.updateWorkspaceCounter(tx, workspaceId, service, units);
        await this.logUsage(tx, workspaceId, service, units, totalCost, "GRACE");

        return {
          success: true,
          method: "GRACE",
          pending: true,
          message: `Used ${units} ${service} during grace period. Payment required.`
        };
      }

      // 7. No credits available
      const limit = await this.getCurrentLimit(workspace, service);
      const used = await this.getCurrentUsage(workspace, service);

      let errorMessage = "";
      let errorCode = "INSUFFICIENT_CREDITS";

      switch (service) {
        case Services.SUBSCRIBERS:
          errorMessage = `Subscriber limit reached. You have ${used}/${limit} subscribers. Please upgrade your plan or top up your wallet.`;
          errorCode = "SUBSCRIBER_LIMIT_EXCEEDED";
          break;
        case Services.EMAIL:
          errorMessage = `Email limit reached. You have sent ${used}/${limit} emails. Please upgrade your plan or top up your wallet.`;
          errorCode = "EMAIL_LIMIT_EXCEEDED";
          break;
        case Services.SMS:
          errorMessage = `SMS limit reached. You have sent ${used}/${limit} SMS. Please upgrade your plan or top up your wallet.`;
          errorCode = "SMS_LIMIT_EXCEEDED";
          break;
        case Services.OTP:
          errorMessage = `OTP limit reached. You have used ${used}/${limit} OTPs. Please upgrade your plan or top up your wallet.`;
          errorCode = "OTP_LIMIT_EXCEEDED";
          break;
        case Services.STORAGE:
          errorMessage = `Storage limit reached. You have used ${used}/${limit} MB. Please upgrade your plan or top up your wallet.`;
          errorCode = "STORAGE_LIMIT_EXCEEDED";
          break;
        case Services.API:
          errorMessage = `API call limit reached. You have made ${used}/${limit} API calls. Please upgrade your plan or top up your wallet.`;
          errorCode = "API_LIMIT_EXCEEDED";
          break;
        case Services.BLOG:
          errorMessage = `Blog post limit reached. You have ${used}/${limit} blog posts. Please upgrade your plan or top up your wallet.`;
          errorCode = "BLOG_LIMIT_EXCEEDED";
          break;
        case Services.PUSH:
          errorMessage = `Push notification limit reached. You have sent ${used}/${limit} pushes. Please upgrade your plan or top up your wallet.`;
          errorCode = "PUSH_LIMIT_EXCEEDED";
          break;
        default:
          errorMessage = `${service} limit reached. Please upgrade your plan or top up your wallet.`;
      }

      return {
        success: false,
        error: errorMessage,
        code: errorCode,
        limit,
        used,
        required: totalCost,
        balance: workspace.wallet?.balance.toNumber() || 0
      };
    });
  }

  /**
   * Get current limit from workspace plan
   */
  private static async getCurrentLimit(workspace: any, service: Services): Promise<number> {
    const plan = workspace.subscription?.plan;

    switch (service) {
      case Services.EMAIL: return plan?.emailCredits || plan?.emailLimit || workspace.emailLimit || 0;
      case Services.SMS: return plan?.smsCredits || plan?.smsLimit || workspace.smsLimit || 0;
      case Services.OTP: return plan?.otpCredits || plan?.otpLimit || workspace.otpLimit || 0;
      case Services.STORAGE: return plan?.storageCredits || plan?.storageLimit || workspace.fileLimit || 0;
      case Services.PUSH: return plan?.pushLimit || workspace.pushLimit || 0;
      case Services.BLOG: return plan?.blogLimit || workspace.blogLimit || 0;
      case Services.API: return plan?.apiLimit || workspace.apiLimit || 0;
      case Services.SUBSCRIBERS: return plan?.subscriberLimit || workspace.subscriberLimit || 0;
      default: return 0;
    }
  }

  /**
   * Get current usage from workspace
   */
  private static async getCurrentUsage(workspace: any, service: Services): Promise<number> {
    switch (service) {
      case Services.SUBSCRIBERS: return workspace.currentSubscribers || 0;
      case Services.EMAIL: return workspace.currentEmailsSent || 0;
      case Services.SMS: return workspace.currentSmsSent || 0;
      case Services.OTP: return workspace.currentOtpSent || 0;
      case Services.STORAGE: return workspace.currentFilesUsed || 0;
      case Services.API: return workspace.currentApiCalls || 0;
      case Services.BLOG: return workspace.currentBlogsCount || 0;
      case Services.PUSH: return workspace.currentPushSent || 0;
      default: return 0;
    }
  }

  /**
   * Get plan bundle limit from subscription plan
   */
  private static getPlanBundleLimit(workspace: any, service: Services): number {
    const plan = workspace.subscription?.plan || null;
    if (!plan) return 0;

    switch (service) {
      case Services.EMAIL: return plan.emailCredits || plan.emailLimit || 0;
      case Services.SMS: return plan.smsCredits || plan.smsLimit || 0;
      case Services.OTP: return plan.otpCredits || plan.otpLimit || 0;
      case Services.STORAGE: return plan.storageCredits || plan.storageLimit || 0;
      case Services.PUSH: return plan.pushLimit || 0;
      case Services.BLOG: return plan.blogLimit || 0;
      case Services.API: return plan.apiLimit || 0;
      case Services.SUBSCRIBERS: return plan.subscriberLimit || 0;
      default: return 0;
    }
  }

  /**
   * Update workspace counter for any service
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
        updateData.currentFilesUsed = { increment: units };
        break;
      case Services.API:
        updateData.currentApiCalls = { increment: units };
        break;
      case Services.BLOG:
        updateData.currentBlogsCount = { increment: units };
        break;
      case Services.PUSH:
        updateData.currentPushSent = { increment: units };
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
    hasWalletBalance?: boolean;
    canUseTopUp?: boolean;
  }> {
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        wallet: true,
        subscription: { include: { plan: true } }
      }
    });

    if (!workspace) {
      return { success: false, remaining: 0, limit: 0, used: 0 };
    }

    const limit = await this.getCurrentLimit(workspace, service);
    const used = await this.getCurrentUsage(workspace, service);
    const bundleRemaining = limit - used;

    // Check bundle first
    if (bundleRemaining >= units) {
      return {
        success: true,
        remaining: bundleRemaining - units,
        limit,
        used,
        hasWalletBalance: true,
        canUseTopUp: false
      };
    }

    // Check if wallet has balance for top-up
    const serviceCost = await db.serviceCost.findUnique({ where: { service } });
    if (serviceCost && workspace.wallet) {
      const totalCost = serviceCost.usageRate.toNumber() * units;
      const hasBalance = workspace.wallet.balance.toNumber() >= totalCost;

      return {
        success: hasBalance,
        remaining: hasBalance ? 999999 : 0,
        limit,
        used,
        hasWalletBalance: hasBalance,
        canUseTopUp: true
      };
    }

    return {
      success: false,
      remaining: 0,
      limit,
      used,
      hasWalletBalance: false,
      canUseTopUp: false
    };
  }
}




// import { db } from "../db";
// import { dropid } from "../utils";
// import { Services } from "../generated/prisma";
//
// export class BillingService {
//   /**
//    * Deducts credits for a service usage.
//    * Logic:
//    * 1. Check monthly bundle credits first (via MonthlyUsage).
//    * 2. If reach limit, deduct from top-up wallet balance based on ServiceCost.
//    */
//   static async deductCredits(workspaceId: string, service: Services, units: number = 1) {
//     const month = new Date().toISOString().slice(0, 7); // YYYY-MM
//
//     // 1. Get Workspace with Wallet and Subscription
//     const workspace = await db.workspace.findUnique({
//       where: { id: workspaceId },
//       include: {
//         wallet: true,
//         subscription: {
//           include: { plan: true }
//         }
//       }
//     });
//
//     if (!workspace) throw new Error("Workspace not found");
//
//     // 2. Get current cost for the service
//     const serviceCost = await db.serviceCost.findUnique({
//       where: { service }
//     });
//
//     if (!serviceCost) throw new Error(`Cost not configured for service: ${service}`);
//
//     // Use usageRate for deduction from wallet
//     const totalCost = serviceCost.usageRate.toNumber() * units;
//
//     return await db.$transaction(async (tx) => {
//       // 3. Get or Create MonthlyUsage for this service
//       let monthlyUsage = await tx.monthlyUsage.findUnique({
//         where: {
//           workspaceId_service_month: {
//             workspaceId,
//             service,
//             month
//           }
//         }
//       });
//
//       if (!monthlyUsage) {
//         // Initialize monthly usage from plan if available
//         const bundleLimit = this.getPlanBundleLimit(workspace, service);
//         monthlyUsage = await tx.monthlyUsage.create({
//           data: {
//             id: dropid('mus'),
//             workspaceId,
//             service,
//             month,
//             bundleLimit
//           }
//         });
//       }
//
//       const bundleRemaining = monthlyUsage.bundleLimit - monthlyUsage.unitsUsed;
//
//       // 4. Try Bundle Credits First
//       if (bundleRemaining >= units) {
//         await tx.monthlyUsage.update({
//           where: { id: monthlyUsage.id },
//           data: {
//             unitsUsed: { increment: units }
//           }
//         });
//
//         await this.logUsage(tx, workspaceId, service, units, 0, "BUNDLE");
//         return { success: true, method: "BUNDLE", remaining: bundleRemaining - units };
//       }
//
//       // 5. If bundle exhausted or partially exhausted, check Top-Up Balance
//       if (workspace.wallet && workspace.wallet.balance.toNumber() >= totalCost) {
//         const updatedWallet = await tx.wallet.update({
//           where: { workspaceId },
//           data: {
//             balance: { decrement: totalCost }
//           }
//         });
//
//         await tx.monthlyUsage.update({
//           where: { id: monthlyUsage.id },
//           data: {
//             topUpUnitsUsed: { increment: units },
//             topUpCost: { increment: totalCost }
//           }
//         });
//
//         await this.logUsage(tx, workspaceId, service, units, totalCost, "TOP_UP");
//
//         // Check for auto top-up
//         if (workspace.autoTopUpEnabled &&
//             updatedWallet.balance.toNumber() < workspace.autoTopUpThreshold.toNumber()) {
//           console.log(`[Billing] Triggering auto top-up for ${workspaceId}`);
//         }
//
//         return { success: true, method: "TOP_UP", cost: totalCost };
//       }
//
//       // 6. Grace Mode check
//       if (workspace.gracePeriodUntil && workspace.gracePeriodUntil > new Date()) {
//         await this.logUsage(tx, workspaceId, service, units, totalCost, "GRACE");
//         return { success: true, method: "GRACE", pending: true };
//       }
//
//       return { success: false, error: "INSUFFICIENT_CREDITS" };
//     });
//   }
//
//   private static getPlanBundleLimit(workspace: any, service: Services): number {
//     const plan = workspace.subscription?.plan || null;
//     if (!plan) return 0;
//
//     switch (service) {
//       case Services.EMAIL: return plan.emailCredits || plan.emailLimit || 0;
//       case Services.SMS: return plan.smsCredits || plan.smsLimit || 0;
//       case Services.OTP: return plan.otpCredits || plan.otpLimit || 0;
//       case Services.STORAGE: return plan.storageCredits || plan.storageLimit || 0;
//       case Services.PUSH: return plan.pushLimit || 0;
//       case Services.BLOG: return plan.blogLimit || 0;
//       case Services.API: return plan.apiLimit || 0;
//       case Services.SUBSCRIBERS: return plan.subscriberLimit || 0;
//       default: return 0;
//     }
//   }
//
//   private static async logUsage(tx: any, workspaceId: string, service: Services, units: number, cost: number, method: string) {
//     const month = new Date().toISOString().slice(0, 7);
//
//     // 1. Create the usage log
//     await tx.usageLog.create({
//       data: {
//         id: dropid('ulg'),
//         workspaceId,
//         service: service.toString(),
//         month,
//         metadata: {
//           units,
//           cost,
//           method,
//           timestamp: new Date().toISOString()
//         }
//       }
//     });
//
//     // 2. Update the cumulative counters in the Workspace model
//     const updateData: any = {};
//     switch (service) {
//       case Services.EMAIL:
//         updateData.currentEmailsSent = { increment: units };
//         break;
//       case Services.SMS:
//         updateData.currentSmsSent = { increment: units };
//         break;
//       case Services.PUSH:
//         updateData.currentPushSent = { increment: units };
//         break;
//       case Services.BLOG:
//         updateData.currentBlogsCount = { increment: units };
//         break;
//       case Services.API:
//         updateData.currentApiCalls = { increment: units };
//         break;
//       case Services.SUBSCRIBERS:
//         updateData.currentSubscribers = { increment: units };
//         break;
//       case Services.OTP:
//         updateData.currentOtpSent = { increment: units };
//         break;
//       case Services.STORAGE:
//         updateData.currentFilesUsed = { increment: units };
//         break;
//     }
//
//     if (Object.keys(updateData).length > 0) {
//       await tx.workspace.update({
//         where: { id: workspaceId },
//         data: updateData
//       });
//     }
//   }
//
//   /**
//    * Checks if a workspace has access to a feature.
//    */
//   static async hasFeature(workspaceId: string, featureKey: string): Promise<boolean> {
//     const workspace = await db.workspace.findUnique({
//       where: { id: workspaceId },
//       select: {
//         plan: true,
//         subscription: {
//           include: { plan: true }
//         }
//       }
//     });
//
//     if (!workspace) return false;
//
//     // 1. Check if the featureKey is actually a service/limit we track in MonthlyUsage
//     const serviceKey = featureKey.toUpperCase() as keyof typeof Services;
//     if (Services[serviceKey]) {
//       const { success } = await this.checkLimit(workspaceId, Services[serviceKey]);
//       return success;
//     }
//
//     // 2. Check active subscription plan features
//     if (workspace.subscription?.plan) {
//       const features = workspace.subscription.plan.features as any;
//       if (features && features[featureKey] === true) return true;
//     }
//
//     // 3. Fallback: Check if the workspace tier (enum) has default features
//     if (workspace.plan === 'FREE') {
//       const freePlan = await db.plan.findFirst({
//         where: { tier: 'FREE', isArchived: false }
//       });
//       if (freePlan) {
//         const features = freePlan.features as any;
//         return !!(features && features[featureKey] === true);
//       }
//     }
//
//     return false;
//   }
//
//   /**
//    * Checks if a workspace has reached its limit for a service/feature without deducting.
//    */
//   static async checkLimit(workspaceId: string, service: Services, units: number = 0): Promise<{ success: boolean; remaining: number }> {
//     const month = new Date().toISOString().slice(0, 7);
//
//     const workspace = await db.workspace.findUnique({
//       where: { id: workspaceId },
//       include: {
//         wallet: true,
//         subscription: {
//           include: { plan: true }
//         }
//       }
//     });
//
//     if (!workspace) return { success: false, remaining: 0 };
//
//     const monthlyUsage = await db.monthlyUsage.findUnique({
//       where: {
//         workspaceId_service_month: {
//           workspaceId,
//           service,
//           month
//         }
//       }
//     });
//
//     const bundleLimit = monthlyUsage ? monthlyUsage.bundleLimit : this.getPlanBundleLimit(workspace, service);
//     const unitsUsed = monthlyUsage ? monthlyUsage.unitsUsed : 0;
//     const bundleRemaining = bundleLimit - unitsUsed;
//
//     if (bundleRemaining >= units) {
//       return { success: true, remaining: bundleRemaining - units };
//     }
//
//     // If bundle exhausted, check if they have top-up balance (only for credit-based services)
//     // For hard limits like BLOG or SUBSCRIBERS, top-up might not apply unless configured.
//     if (workspace.wallet && workspace.wallet.balance.toNumber() > 0) {
//       // In theory, if they have balance, they can go over limit if service cost is defined.
//       const serviceCost = await db.serviceCost.findUnique({ where: { service } });
//       if (serviceCost && serviceCost.usageRate.toNumber() > 0) {
//         return { success: true, remaining: 999999 }; // Effectively unlimited if they have money
//       }
//     }
//
//     return { success: false, remaining: 0 };
//   }
// }
