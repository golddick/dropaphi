// app/api/billing/promo/list/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const now = new Date();
    
    const promoCodes = await db.promoCode.findMany({
      where: {
        validFrom: { lte: now },
        validUntil: { gte: now },
        OR: [
          { maxUses: null },
          { usedCount: { lt: db.promoCode.fields.maxUses } },
        ],
      },
      select: {
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        validUntil: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log("Active promo codes for user:", promoCodes);

    return ok({ promoCodes });
  } catch (error) {
    console.error("[LIST_PROMOS]", error);
    return serverError();
  }
}