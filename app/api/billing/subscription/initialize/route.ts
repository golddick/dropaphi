// app/api/billing/subscription/initialize/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { initializeCustomSubscription } from "@/lib/paystack";
import { err, ok, serverError, validationError } from "@/lib/respond/response";
import { calculateDiscount, PLANS } from "@/lib/billing/plan";

const schema = z.object({
  tier: z.enum(['STARTER', 'PROFESSIONAL', 'BUSINESS']),
  promoCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    console.log('🔵 [INITIALIZE_SUBSCRIPTION] Starting...');
    
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return err('Payment service not configured', 500);
    }

    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    // Get user details
    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { email: true, fullName: true },
    });

    if (!user) return err("User not found", 404);

    // Get workspace
    const member = await db.workspaceMember.findFirst({
      where: { userId: auth.userId },
      include: { workspace: true },
    });

    if (!member) return err("Workspace not found", 404);

    // Get plan details
    const plan = PLANS.find(p => p.tier === parsed.data.tier);
    if (!plan) return err("Invalid plan", 400);

    // Calculate final amount with discount
    let discount = 0;
    let promoCode = null;
    let finalAmount = plan.price;

    if (parsed.data.promoCode) {
      console.log('🎫 Validating promo code:', parsed.data.promoCode);
      
      promoCode = await db.promoCode.findUnique({
        where: { code: parsed.data.promoCode.toUpperCase() },
      });

      if (!promoCode) return err("Invalid promo code", 400);

      // Check validity
      const now = new Date();
      if (now < promoCode.validFrom || now > promoCode.validUntil) {
        return err("Promo code has expired", 400);
      }

      // Check usage
      if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
        return err("Promo code has reached maximum usage", 400);
      }

      // Check if already used by this workspace
      const existingRedemption = await db.promoRedemption.findFirst({
        where: {
          promoCodeId: promoCode.id,
          workspaceId: member.workspaceId,
        },
      });

      if (existingRedemption && promoCode.firstTimeOnly) {
        return err("This promo code can only be used once", 400);
      }

      // Calculate discount
      discount = calculateDiscount(plan.price, promoCode);
      finalAmount = plan.price - discount;
      
      console.log('💰 Discount applied:', {
        original: plan.price,
        discount,
        final: finalAmount
      });
    }

    // Create invoice
    const invoice = await db.invoice.create({
      data: {
        id: dropid('inv'),
        workspaceId: member.workspaceId,
        invoiceNumber: `SUB-${Date.now()}`,
        amount: plan.price,
        discount: discount,
        finalAmount: finalAmount,
        status: 'PENDING',
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        promoCodeId: promoCode?.id,
        metadata: {
          tier: plan.tier,
          userId: auth.userId,
          workspaceName: member.workspace.name,
        },
      },
    });

    // Initialize Paystack with CUSTOM amount (not using plan)
    // This allows discounts to work
    const response = await initializeCustomSubscription({
      email: user.email,
      amount: finalAmount, // Send the discounted amount
      metadata: {
        workspaceId: member.workspaceId,
        userId: auth.userId,
        tier: plan.tier,
        invoiceId: invoice.id,
        promoCode: parsed.data.promoCode,
        discount: discount,
        originalAmount: plan.price,
        workspaceName: member.workspace.name,
        isSubscription: true,
        planInterval: 'monthly',
      },
    });

    // Update invoice with payment reference
    await db.invoice.update({
      where: { id: invoice.id },
      data: {
        paymentRef: response.data.reference,
      },
    });

    return ok({
      authorization_url: response.data.authorization_url,
      reference: response.data.reference,
      discount,
      finalAmount,
      originalAmount: plan.price,
    });
  } catch (error: any) {
    console.error("🔴 [INITIALIZE_SUBSCRIPTION] Error:", error);
    return serverError();
  }
}










// // app/api/billing/subscription/initialize/route.ts
// import { NextRequest } from "next/server";
// import { z } from "zod";
// import { requireAuth } from "@/lib/auth/auth-server";
// import { db } from "@/lib/db";
// import { dropid } from "dropid";
// import { initializeSubscription } from "@/lib/paystack";
// import { err, ok, serverError, validationError } from "@/lib/respond/response";
// import { calculateDiscount, PLANS } from "@/lib/billing/plan";

// const schema = z.object({
//   tier: z.enum(['STARTER', 'PROFESSIONAL', 'BUSINESS']),
//   promoCode: z.string().optional(),
// });

// export async function POST(req: NextRequest) {
//   try {
//     const auth = await requireAuth();
//     if (auth instanceof Response) return auth;

//     const body = await req.json();
//     const parsed = schema.safeParse(body);
//     if (!parsed.success) return validationError(parsed.error);

//     const user = await db.user.findUnique({
//       where: { id: auth.userId },
//       select: { email: true },
//     });

//     const member = await db.workspaceMember.findFirst({
//       where: { userId: auth.userId },
//     });

//     if (!member || !user) {
//       return err("Workspace not found", 404);
//     }

//     const plan = PLANS.find(p => p.tier === parsed.data.tier);
//     if (!plan || !plan.paystackPlanCode) {
//       return err("Invalid plan", 400);
//     }

//     // Validate promo code if provided
//     let promoCode = null;
//     let discount = 0;
//     let finalAmount = plan.price;

//     if (parsed.data.promoCode) {
//       promoCode = await db.promoCode.findUnique({
//         where: { code: parsed.data.promoCode.toUpperCase() },
//       });

//       if (!promoCode) {
//         return err("Invalid promo code", 400);
//       }

//       // Check validity
//       const now = new Date();
//       if (now < promoCode.validFrom || now > promoCode.validUntil) {
//         return err("Promo code has expired", 400);
//       }

//       // Check usage
//       if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
//         return err("Promo code has reached maximum usage", 400);
//       }

//       // Check if already used by this workspace
//       const existingRedemption = await db.promoRedemption.findFirst({
//         where: {
//           promoCodeId: promoCode.id,
//           workspaceId: member.workspaceId,
//         },
//       });

//       if (existingRedemption && promoCode.firstTimeOnly) {
//         return err("This promo code can only be used once", 400);
//       }

//       // Calculate discount
//       discount = calculateDiscount(plan.price, promoCode);
//       finalAmount = plan.price - discount;
//     }

//     // Create invoice
//     const invoice = await db.invoice.create({
//       data: {
//         id: dropid('inv'),
//         workspaceId: member.workspaceId,
//         invoiceNumber: `SUB-${Date.now()}`,
//         amount: plan.price,
//         discount: discount,
//         finalAmount: finalAmount,
//         status: 'PENDING',
//         periodStart: new Date(),
//         periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//         promoCodeId: promoCode?.id,
//       },
//     });

//     // Initialize Paystack
//     const response = await initializeSubscription({
//       email: user.email,
//       planCode: plan.paystackPlanCode,
//       amount: finalAmount,
//       metadata: {
//         workspaceId: member.workspaceId,
//         tier: plan.tier,
//         invoiceId: invoice.id,
//         promoCode: parsed.data.promoCode,
//         discount: discount,
//         originalAmount: plan.price,
//       },
//     });

//     return ok({
//       authorization_url: response.data.authorization_url,
//       reference: response.data.reference,
//       discount,
//       finalAmount,
//     });
//   } catch (error) {
//     console.error("[INITIALIZE_SUBSCRIPTION]", error);
//     return serverError();
//   }
// }