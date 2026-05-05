import { db } from "@/lib/db";

export type ServiceType = 
  | "email" 
  | "sms" 
  | "otp" 
  | "blog" 
  | "push" 
  | "api" 
  | "storage";

export interface UsageStatus {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  source: "PLAN" | "WALLET" | "NONE";
}

export class UsageService {
  /**
   * Check if a workspace can perform a specific service action
   */
  static async checkUsage(workspaceId: string, service: ServiceType, amount: number = 1): Promise<UsageStatus> {
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      include: { wallet: true },
    });

    if (!workspace) {
      return { allowed: false, current: 0, limit: 0, remaining: 0, source: "NONE" };
    }

    const { limitField, currentField, walletField } = this.getServiceFields(service);

    const planLimit = (workspace as any)[limitField] || 0;
    const currentUsage = (workspace as any)[currentField] || 0;
    const walletCredits = workspace.wallet ? (workspace.wallet as any)[walletField] || 0 : 0;

    // 1. Check Plan Allowance
    if (currentUsage + amount <= planLimit) {
      return {
        allowed: true,
        current: currentUsage,
        limit: planLimit,
        remaining: planLimit - currentUsage,
        source: "PLAN",
      };
    }

    // 2. Check Wallet Credits
    if (walletCredits >= amount) {
      return {
        allowed: true,
        current: currentUsage,
        limit: planLimit + walletCredits,
        remaining: walletCredits,
        source: "WALLET",
      };
    }

    return {
      allowed: false,
      current: currentUsage,
      limit: planLimit,
      remaining: 0,
      source: "NONE",
    };
  }

  /**
   * Consume usage for a specific service
   * Logic: Plan first, then Wallet credits
   */
  static async consumeUsage(workspaceId: string, service: ServiceType, amount: number = 1) {
    const status = await this.checkUsage(workspaceId, service, amount);

    if (!status.allowed) {
      throw new Error(`Insufficient ${service} allowance/credits`);
    }

    const { limitField, currentField, walletField } = this.getServiceFields(service);

    if (status.source === "PLAN") {
      return db.workspace.update({
        where: { id: workspaceId },
        data: {
          [currentField]: { increment: amount },
        },
      });
    } else if (status.source === "WALLET") {
      return db.wallet.update({
        where: { workspaceId },
        data: {
          [walletField]: { decrement: amount },
        },
      });
    }
  }

  private static getServiceFields(service: ServiceType) {
    const mapping: Record<ServiceType, { limitField: string; currentField: string; walletField: string }> = {
      email: { limitField: "emailLimit", currentField: "currentEmailsSent", walletField: "emailCredits" },
      sms: { limitField: "smsLimit", currentField: "currentSmsSent", walletField: "smsCredits" },
      otp: { limitField: "otpLimit", currentField: "currentOtpSent", walletField: "otpCredits" },
      blog: { limitField: "blogLimit", currentField: "currentBlogsCount", walletField: "blogCredits" },
      push: { limitField: "pushLimit", currentField: "currentPushSent", walletField: "pushCredits" },
      api: { limitField: "apiLimit", currentField: "currentApiCalls", walletField: "apiCredits" },
      storage: { limitField: "fileLimit", currentField: "currentFilesUsed", walletField: "storageCredits" },
    };

    return mapping[service];
  }
}
