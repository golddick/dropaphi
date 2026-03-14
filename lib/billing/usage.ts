// // lib/billing/usage.ts
// import { db } from '@/lib/db';
// import { PLANS } from './plan';
// import { Decimal } from '@prisma/client/runtime/client';

// export async function checkUsageLimit(
//   workspaceId: string,
//   service: keyof typeof PLANS[0]['apiLimits']
// ): Promise<boolean> {
//   try {
//     // Get workspace subscription
//     const subscription = await db.workspaceSubscription.findUnique({
//       where: { workspaceId },
//     });

//     if (!subscription) return true; // No subscription = no limit (free tier)

//     const plan = PLANS.find(p => p.tier === subscription.tier);
//     if (!plan) return true;

//     const limit = plan.apiLimits[service];

//     // Get current period usage
//     const startOfMonth = new Date();
//     startOfMonth.setDate(1);
//     startOfMonth.setHours(0, 0, 0, 0);

//     const usage = await db.usageLog.aggregate({
//       where: {
//         workspaceId,
//         service,
//         createdAt: { gte: startOfMonth },
//       },
//       _sum: { creditsUsed: true },
//     });

//     const used = usage._sum.creditsUsed || new Decimal(0);
    
//     // Convert Decimal to number for comparison
//     return used.toNumber() < limit;
//   } catch (error) {
//     console.error('[CHECK_USAGE_LIMIT]', error);
//     return false;
//   }
// }



