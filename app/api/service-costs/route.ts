import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";

export async function GET() {
  try {
    const costs = await db.serviceCost.findMany({
      where: { isActive: true },
      select: {
        service: true,
        cost: true,
        usageRate: true,
        minPurchase: true,
        isActive: true,
        description: true,
      },
      orderBy: { service: 'asc' }
    });

    return ok(costs);
  } catch (error) {
    console.error('[PUBLIC_SERVICE_COSTS_GET]', error);
    return serverError('Failed to fetch service costs');
  }
}
