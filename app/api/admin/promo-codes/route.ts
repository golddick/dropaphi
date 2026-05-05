// app/api/admin/promo-codes/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { err, ok, serverError, validationError } from "@/lib/respond/response";
import { requireAdmin } from "@/lib/auth/admin-auth";

const createPromoSchema = z.object({
  code: z.string().min(3).max(20).transform(s => s.toUpperCase()),
  description: z.string().min(5),
  discountType: z.enum(['PERCENTAGE', 'FLAT_AMOUNT', 'FLAT_CREDIT']),
  discountValue: z.number().min(1).optional(),
  bonusCredits: z.number().min(1).optional(),
  flatDiscount: z.number().min(1).optional(),
  maxUses: z.number().min(1).optional(),
  validFrom: z.string().transform(s => new Date(s)),
  validUntil: z.string().transform(s => new Date(s)),
  expiryDate: z.string().optional().transform(s => s ? new Date(s) : undefined),
  minPlanTier: z.enum(['FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS']).optional(),
  appliesToPlans: z.array(z.string()).optional(),
  firstTimeOnly: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  try {
    console.log('[Admin API] Fetching promo codes...');
    
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const promoCodes = await db.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { redemptions: true },
        },
      },
    });

    console.log(`[Admin API] Found ${promoCodes.length} promo codes`);

    // Format the data
    const formatted = promoCodes.map(p => ({
      id: p.id,
      code: p.code,
      description: p.description,
      discountType: p.discountType,
      discountValue: p.discountValue,
      bonusCredits: p.bonusCredits,
      flatDiscount: p.flatDiscount,
      maxUses: p.maxUses,
      usedCount: p.usedCount,
      validFrom: p.validFrom.toISOString(),
      validUntil: p.validUntil.toISOString(),
      expiryDate: p.expiryDate?.toISOString() || null,
      minPlanTier: p.minPlanTier,
      appliesToPlans: p.appliesToPlans ? JSON.parse(p.appliesToPlans as string) : null,
      firstTimeOnly: p.firstTimeOnly,
      createdAt: p.createdAt.toISOString(),
    }));

    // Return a clean structure: { success: true, data: formatted }
    // This way the array is directly at response.data
    return ok({ data: formatted });
  } catch (error) {
    console.error("[GET_PROMO_CODES]", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const parsed = createPromoSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    // Check if code already exists
    const existing = await db.promoCode.findUnique({
      where: { code: parsed.data.code },
    });

    if (existing) {
      return err("Promo code already exists", 400);
    }

    const promoCode = await db.promoCode.create({
      data: {
        id: dropid('promo'),
        code: parsed.data.code,
        description: parsed.data.description,
        discountType: parsed.data.discountType,
        discountValue: parsed.data.discountValue,
        bonusCredits: parsed.data.bonusCredits,
        flatDiscount: parsed.data.flatDiscount,
        maxUses: parsed.data.maxUses,
        validFrom: parsed.data.validFrom,
        validUntil: parsed.data.validUntil,
        expiryDate: parsed.data.expiryDate,
        minPlanTier: parsed.data.minPlanTier,
        appliesToPlans: parsed.data.appliesToPlans ? JSON.stringify(parsed.data.appliesToPlans) : undefined,
        firstTimeOnly: parsed.data.firstTimeOnly,
      },
    });

    return ok({ data: promoCode }, "Promo code created successfully");
  } catch (error) {
    console.error("[CREATE_PROMO_CODE]", error);
    return serverError();
  }
}