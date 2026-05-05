import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";
import { requireAuth } from "@/lib/auth/auth-server";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const costs = await db.serviceCost.findMany({
      where: { isActive: true }
    });
    
    const pricing: Record<string, { amount: number; price: number; usageRate: number; minPurchase: number; isActive: boolean }> = {};
    
    costs.forEach(c => {
      const uiKey = c.service.toLowerCase();
      pricing[uiKey] = {
        amount: 1, // Base unit
        price: Number(c.cost),
        usageRate: c.usageRate,
        minPurchase: c.minPurchase,
        isActive: c.isActive
      };
    });

    return ok(pricing);
  } catch (error) {
    console.error('[PRICING_GET]', error);
    return serverError('Failed to fetch pricing');
  }
}
