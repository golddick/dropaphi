

// app/api/workspace/[workspaceId]/topup/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { ok, unauthorized, serverError, err, validationError } from "@/lib/respond/response";
import { initializeCustomSubscription } from "@/lib/paystack";
import { dropid } from "dropid";
import { z } from "zod";
import { Services } from "@/lib/generated/prisma";

const topUpSchema = z.object({
  serviceType: z.enum(['email', 'sms', 'otp', 'blog', 'push', 'ai', 'storage']),
  quantity: z.coerce.number().positive().min(1, "Quantity must be at least 1"),
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

    const { serviceType, quantity, promoCode: promoCodeString } = parsed.data;
    
    // Map service type to Services enum and wallet field
    const serviceMapping: Record<string, { enum: Services; walletField: string; displayName: string }> = {
      email: { enum: Services.EMAIL, walletField: 'emailCredits', displayName: 'Email' },
      sms: { enum: Services.SMS, walletField: 'smsCredits', displayName: 'SMS' },
      otp: { enum: Services.OTP, walletField: 'otpCredits', displayName: 'OTP' },
      blog: { enum: Services.BLOG, walletField: 'blogCredits', displayName: 'Blog' },
      push: { enum: Services.PUSH, walletField: 'pushCredits', displayName: 'Push' },
      ai: { enum: Services.AI, walletField: 'aiCredits', displayName: 'AI' },
      storage: { enum: Services.STORAGE, walletField: 'storageCredits', displayName: 'Storage' },
    };

    const selectedService = serviceMapping[serviceType];
    if (!selectedService) {
      return err("Invalid service type", 400);
    }

    // Get cost configuration from database
    const costConfig = await db.serviceCost.findUnique({
      where: { service: selectedService.enum }
    });

    if (!costConfig || !costConfig.isActive) {
      return err(`${serviceType} service is currently unavailable`, 400);
    }

    const minPurchase = Number(costConfig.minPurchase);
  if (quantity < minPurchase) {
    return err(`Minimum purchase for ${serviceType} is ${minPurchase} ${serviceType} credits`, 400);
  }

    // Calculate price based on database cost
    const price = Number(costConfig.cost) * quantity;
    const usageRate = Number(costConfig.usageRate);

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
      select: { email: true, fullName: true }
    });

    if (!user) return err("User not found", 404);

    // Calculate promo discount
    let finalAmount = price;
    let discount = 0;
    let promoCodeId = undefined;
    let bonusCredits = 0;

    if (promoCodeString) {
      const promo = await db.promoCode.findUnique({
        where: { code: promoCodeString.toUpperCase() }
      });

      if (promo && new Date() <= promo.validUntil && (!promo.maxUses || promo.usedCount < promo.maxUses)) {
        if (promo.discountType === 'PERCENTAGE' && promo.discountValue) {
          discount = Math.round(price * (promo.discountValue / 100));
        } else if (promo.discountType === 'FLAT_AMOUNT' && promo.flatDiscount) {
          discount = promo.flatDiscount.toNumber();
        } else if (promo.discountType === 'FLAT_CREDIT' && promo.bonusCredits) {
          // FLAT_CREDIT gives extra free credits
          bonusCredits = promo.bonusCredits;
          discount = 0;
        }
        
        discount = Math.min(discount, price);
        finalAmount = price - discount;
        promoCodeId = promo.id;
      }
    }

    // Create PENDING invoice
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
        description: `Top-up: ${quantity.toLocaleString()} ${serviceType.toUpperCase()} credits`,
        billingEmail: user.email,
        promoCodeId,
        metadata: {
          type: 'top_up',
          serviceType: selectedService.enum,
          quantity,
          price,
          usageRate,
          bonusCredits,
          promoCode: promoCodeString,
        },
        items: {
          create: [{
            id: dropid('iti'),
            description: `${quantity.toLocaleString()} ${serviceType.toUpperCase()} credits @ ₦${costConfig.cost}/credit`,
            amount: price,
            quantity: quantity
          }]
        }
      }
    });

    // Initialize Paystack payment
    const response = await initializeCustomSubscription({
      email: user.email,
      amount: finalAmount,
      metadata: {
        type: 'top_up',
        workspaceId,
        userId: auth.userId,
        invoiceId,
        serviceType: selectedService.enum,
        walletField: selectedService.walletField,
        quantity,
        usageRate,
        bonusCredits,
        promoCode: promoCodeString,
      },
    });

    // Update invoice with payment reference
    await db.invoice.update({
      where: { id: invoiceId },
      data: { paymentRef: response.data.reference },
    });

    return ok({ 
      authorization_url: response.data.authorization_url,
      reference: response.data.reference,
      invoiceId,
      details: {
        service: serviceType,
        quantity,
        price: finalAmount,
        originalPrice: price,
        discount,
        bonusCredits: bonusCredits > 0 ? `${bonusCredits} bonus credits` : null,
      }
    });

  } catch (error) {
    console.error("[TOPUP_ERROR]", error);
    return serverError();
  }
}