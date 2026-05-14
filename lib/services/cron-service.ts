import { db } from "../db";

export class CronService {
  /**
   * Resets monthly credits for workspaces.
   * Runs on the 1st of every month.
   */
  static async resetMonthlyCredits() {
    console.log("[CRON] Starting monthly credit reset...");
    
    const workspaces = await db.workspace.findMany({
      include: {
        subscription: {
          include: { plan: true }
        },
        wallet: true
      }
    });

    for (const workspace of workspaces) {
      const plan = workspace.subscription?.plan;
      if (!plan) continue;

      try {
        await db.$transaction(async (tx) => {
          if (plan.rollOverCredits) {
            // Roll over existing bundle credits for paid plans
            await tx.wallet.update({
              where: { workspaceId: workspace.id },
              data: {
                emailCredits: { increment: plan.emailCredits },
                smsCredits: { increment: plan.smsCredits },
                otpCredits: { increment: plan.otpCredits },
                storageCredits: { increment: plan.storageCredits },
              }
            });
          } else {
            // Hard reset for free plans (or plans without rollover)
            await tx.wallet.update({
              where: { workspaceId: workspace.id },
              data: {
                emailCredits: plan.emailCredits,
                smsCredits: plan.smsCredits,
                otpCredits: plan.otpCredits,
                storageCredits: plan.storageCredits,
              }
            });
          }

          // Reset monthly usage counters in Workspace model
          await tx.workspace.update({
            where: { id: workspace.id },
            data: {
              currentEmailsSent: 0,
              currentSmsSent: 0,
              currentOtpSent: 0,
              currentApiCalls: 0,
              // We usually don't reset subscribers or files used as they are cumulative/quota based
            }
          });

          console.log(`[CRON] Reset credits for workspace: ${workspace.id}`);
        });
      } catch (error) {
        console.error(`[CRON] Failed to reset credits for workspace ${workspace.id}:`, error);
      }
    }
    
    console.log("[CRON] Monthly credit reset completed.");
  }

  /**
   * Purges usage log metadata older than 7 days.
   */
  static async purgeUsageLogMetadata() {
    console.log("[CRON] Starting usage log metadata purge...");
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      // We don't delete the logs, just nullify/clear the metadata to save space and respect privacy
      const result = await db.usageLog.updateMany({
        where: {
          createdAt: { lt: sevenDaysAgo }
        },
        data: {
          metadata: {}
        }
      });
      
      console.log(`[CRON] Purged metadata for ${result.count} logs.`);
    } catch (error) {
      console.error("[CRON] Metadata purge failed:", error);
    }
  }
}
