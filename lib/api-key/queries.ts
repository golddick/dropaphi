// lib/api-key/queries.ts
import { db } from "@/lib/db";

/**
 * Check if workspace can create production keys based on plan
 */
export async function canCreateProductionKey(workspaceId: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    console.log(`[canCreateProductionKey] Checking for workspace: ${workspaceId}`);
    
    const subscription = await db.workspaceSubscription.findUnique({
      where: { workspaceId },
    });

    console.log(`[canCreateProductionKey] Subscription found:`, subscription);

    if (!subscription) {
      return { allowed: false, reason: "No active subscription" };
    }

    if (subscription.tier === 'FREE') {
      return { 
        allowed: false, 
        reason: "Free plan does not support production API keys. Please upgrade to create live keys." 
      };
    }

    const keyCount = await db.apiKey.count({
      where: { 
        workspaceId,
        status: 'ACTIVE',
      },
    });

    console.log(`[canCreateProductionKey] Active key count: ${keyCount}`);

    const limits = {
      'STARTER': 3,
      'PROFESSIONAL': 5,
      'BUSINESS': 10,
    };

    const limit = limits[subscription.tier as keyof typeof limits] || 5;
    
    if (keyCount >= limit) {
      return { 
        allowed: false, 
        reason: `You have reached the maximum number of API keys (${limit}) for your plan.` 
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("[canCreateProductionKey] Error:", error);
    return { allowed: false, reason: "Error checking production key eligibility" };
  }
}