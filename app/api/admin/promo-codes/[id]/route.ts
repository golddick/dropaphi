// app/api/admin/promo-codes/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { err, ok, serverError, validationError } from "@/lib/respond/response";
import { requireAdmin } from "@/lib/auth/admin-auth";

const updatePromoSchema = z.object({
  description: z.string().min(5).optional(),
  discountValue: z.number().min(1).optional(),
  maxUses: z.number().min(1).optional().nullable(),
  validFrom: z.string().transform(s => new Date(s)).optional(),
  validUntil: z.string().transform(s => new Date(s)).optional(),
  minPlanTier: z.enum(['STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE']).optional().nullable(),
  appliesToPlans: z.array(z.string()).optional().nullable(),
  firstTimeOnly: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const parsed = updatePromoSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const promoCode = await db.promoCode.findUnique({
      where: { id },
    });

    if (!promoCode) {
      return err("Promo code not found", 404);
    }

    const updated = await db.promoCode.update({
      where: { id },
      data: {
        description: parsed.data.description,
        discountValue: parsed.data.discountValue,
        maxUses: parsed.data.maxUses,
        validFrom: parsed.data.validFrom,
        validUntil: parsed.data.validUntil,
        minPlanTier: parsed.data.minPlanTier,
        appliesToPlans: parsed.data.appliesToPlans ? JSON.stringify(parsed.data.appliesToPlans) : undefined,
        firstTimeOnly: parsed.data.firstTimeOnly,
      },
    });

    return ok({ data: updated }, "Promo code updated");
  } catch (error) {
    console.error("[UPDATE_PROMO_CODE]", error);
    return serverError();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    await db.promoCode.delete({
      where: { id },
    });

    return ok(null, "Promo code deleted");
  } catch (error) {
    console.error("[DELETE_PROMO_CODE]", error);
    return serverError();
  }
}