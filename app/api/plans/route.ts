import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";
import { PLANS } from "@/lib/billing/plan";

// Public endpoint: returns active plans from DB, or static fallback when DB is empty
export async function GET(_req: NextRequest) {
  try {
    const plans = await db.plan.findMany({
      where: { isArchived: false },
      orderBy: { price: "asc" },
      select: {
        id: true,
        tier: true,
        name: true,
        price: true,
        interval: true,
        features: true,
        isArchived: true,
        blogLimit: true,
        pushLimit: true,
        subscriberLimit: true,
        emailLimit: true,
        smsLimit: true,
        otpLimit: true,
        storageLimit: true,
        aiLimit: true,
        devApiAccess: true,
      },
    });

    // If no plans exist in DB, return static fallback
    if (!plans || plans.length === 0) {
      // expose only fields needed by UI, mimic DB shape (no id)
      const fallback = PLANS.map((p) => ({
        id: undefined as unknown as string | undefined,
        tier: p.tier as any,
        name: p.name,
        price: p.price,
        interval: ("MONTHLY" as const),
        features: (p as any).features ?? {},
        isArchived: false,
      }));
      return ok({ plans: fallback });
    }

    return ok({ plans });
  } catch (error) {
    console.error("[PUBLIC_PLANS_GET]", error);
    return serverError("Failed to fetch plans");
  }
}
