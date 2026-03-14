// app/api/billing/promo/validate/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { err, ok, serverError, validationError } from "@/lib/respond/response";

const schema = z.object({
  code: z.string().min(3).max(20),
  planTier: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    console.log("Validating promo code:", parsed.data.code, "for plan tier:", parsed.data.planTier);

    // Get user's workspace
    const member = await db.workspaceMember.findFirst({
      where: { userId: auth.userId },
    });

    if (!member) {
      return err("Workspace not found", 404);
    }

    // Find promo code
    const promoCode = await db.promoCode.findUnique({
      where: { code: parsed.data.code.toUpperCase() },
    });

    if (!promoCode) {
      return err("Invalid promo code", 404);
    }

    // Check validity period
    const now = new Date();
    if (now < promoCode.validFrom || now > promoCode.validUntil) {
      return err("Promo code has expired", 400);
    }

    // Check usage limit
    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return err("Promo code has reached maximum usage", 400);
    }

    // Check if workspace has already used this code
    const existingRedemption = await db.promoRedemption.findFirst({
      where: {
        promoCodeId: promoCode.id,
        workspaceId: member.workspaceId,
      },
    });

    if (existingRedemption && promoCode.firstTimeOnly) {
      return err("This promo code can only be used once", 400);
    }

    // Check plan restrictions
    if (promoCode.appliesToPlans && parsed.data.planTier) {
      const allowedPlans = JSON.parse(promoCode.appliesToPlans as string);
      if (!allowedPlans.includes(parsed.data.planTier)) {
        return err("This promo code does not apply to the selected plan", 400);
      }
    }

    return ok({
      code: promoCode.code,
      description: promoCode.description,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
    });
  } catch (error) {
    console.error("[VALIDATE_PROMO]", error);
    return serverError();
  }
}