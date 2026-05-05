import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { ok, unauthorized, notFound, serverError, err, validationError } from "@/lib/respond/response";
import { ServiceType } from "@/lib/billing/usage";
import { initializeCustomSubscription } from "@/lib/paystack";
import { dropid } from "dropid";
import { z } from "zod";

const topUpSchema = z.object({
  // accept known UI service keys; normalize on server if needed
  serviceType: z.enum(['email','sms','otp','blog','push','api','storage']).or(z.string()),
  quantity: z.coerce.number().positive(),
  price: z.coerce.number().positive(),
  promoCode: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const { workspaceId } = await params;
    const body = await req.json();
    
    const parsed = topUpSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { serviceType, quantity, price: frontendPrice, promoCode: promoCodeString } = parsed.data as any;
    
    // Normalize UI service keys to billing-service canonical keys
    const normalizeService = (key: string): string => {
      return key.toUpperCase();
    };
    const normalizedServiceType = normalizeService(serviceType);

    // SECURITY: Validate price against DB if it's not a balance top-up
    let validatedPrice = frontendPrice;
    if (serviceType !== 'balance') {
        const costConfig = await db.serviceCost.findUnique({
            where: { service: normalizedServiceType as any }
        });

        if (costConfig) {
            if (!costConfig.isActive) {
                return err(`${serviceType} service is currently unavailable`, 400);
            }

            if (quantity < costConfig.minPurchase) {
                return err(`Minimum purchase for ${serviceType} is ${costConfig.minPurchase} units`, 400);
            }

            const expectedPrice = Number(costConfig.cost) * quantity;
            if (Math.abs(expectedPrice - frontendPrice) > 1) {
                console.warn(`[WALLET_TOPUP] Price mismatch. Expected: ${expectedPrice}, Received: ${frontendPrice}`);
                // Optional: Force the correct price instead of erroring, 
                // but erroring is safer to alert of UI issues.
                return err(`Price mismatch. Expected ₦${expectedPrice}`, 400);
            }
        }
    }
    const price = validatedPrice;

    // Check if user has access to this workspace
    const membership = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
        role: { in: ['OWNER', 'ADMIN'] }
      },
    });

    if (!membership) {
      return unauthorized("Only owners and admins can perform top-ups");
    }

    const user = await db.user.findUnique({
        where: { id: auth.userId },
        select: { email: true }
    });

    if (!user) return err("User not found", 404);

    // Initial amount before promo
    let finalAmount = price;
    let discount = 0;
    let promoCodeId = undefined;

    if (promoCodeString) {
        const promo = await db.promoCode.findUnique({
            where: { code: promoCodeString.toUpperCase() }
        });

        if (promo && new Date() <= promo.validUntil && (!promo.maxUses || promo.usedCount < promo.maxUses)) {
            if (promo.discountType === 'PERCENTAGE') {
                discount = Math.round(price * ((promo.discountValue || 0) / 100));
            } else if (promo.discountType === 'FLAT_AMOUNT') {
                discount = promo.flatDiscount ? promo.flatDiscount.toNumber() : (promo.discountValue || 0);
            } else if (promo.discountType === 'FLAT_CREDIT') {
                // For FLAT_CREDIT, we don't discount the price, we give extra credits
                // This will be handled when the payment is confirmed
                discount = 0;
            }
            
            discount = Math.min(discount, price);
            finalAmount = price - discount;
            promoCodeId = promo.id;
        }
    }

    // 1. Create a PENDING invoice
    const invoiceId = dropid('inv');
    await db.invoice.create({
      data: {
        id: invoiceId,
        workspaceId,
        amount: price,
        discount,
        finalAmount,
        currency: "NGN",
        status: "PENDING",
        invoiceNumber: `TOP-${Date.now()}`,
        description: `Top-up: ${quantity.toLocaleString()} ${normalizedServiceType} units`,
        billingEmail: user.email,
        promoCodeId,
        metadata: {
          type: 'top_up',
          serviceType: normalizedServiceType,
          quantity,
        },
        items: {
          create: [{
            id: dropid('iti'),
            description: `${normalizedServiceType} top-up (${quantity.toLocaleString()} units)`,
            amount: price,
            quantity: 1
          }]
        }
      }
    });

    // 2. Initialize Paystack
    const response = await initializeCustomSubscription({
      email: user.email,
      amount: finalAmount,
      metadata: {
        type: 'top_up',
        workspaceId,
        userId: auth.userId,
        invoiceId,
        serviceType: normalizedServiceType,
        quantity,
        amount: finalAmount,
      },
    });

    // 3. Update invoice with payment reference
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentRef: response.data.reference,
      },
    });

    return ok({ 
      authorization_url: response.data.authorization_url,
      reference: response.data.reference 
    });
  } catch (error) {
    console.error("[WALLET_TOPUP_ERROR]", error);
    return serverError();
  }
}
