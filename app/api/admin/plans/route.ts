import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError, forbidden } from "@/lib/respond/response";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { dropid } from "dropid";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const plans = await db.plan.findMany({
      where: { isArchived: false },
      orderBy: { price: 'asc' }
    });

    // Plans are often expected to be wrapped in a data property by the frontend
    // but ok() already does { success: true, data: plans }
    return ok({ plans });
  } catch (error) {
    console.error('[ADMIN_PLANS_GET]', error);
    return serverError('Failed to fetch plans');
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const { 
      name, tier, description, price, interval, 
      subscriberLimit, emailLimit, storageLimit, smsLimit, otpLimit,
      emailCredits, smsCredits, otpCredits, storageCredits,
      extraCreditRate, rollOverCredits,
      features, paystackPlanCode, devApiAccess
    } = body;

    const plan = await db.plan.create({
      data: {
        id: dropid('plan'),
        name,
        tier,
        description,
        price,
        interval,
        subscriberLimit: subscriberLimit ?? 100,
        emailLimit: emailLimit ?? 500,
        storageLimit: storageLimit ?? 100,
        smsLimit: smsLimit ?? 0,
        otpLimit: otpLimit ?? 0,
        emailCredits: emailCredits ?? 0,
        smsCredits: smsCredits ?? 0,
        otpCredits: otpCredits ?? 0,
        storageCredits: storageCredits ?? 0,
        extraCreditRate: extraCreditRate ?? 0,
        rollOverCredits: !!rollOverCredits,
        features,
        paystackPlanCode,
        devApiAccess: devApiAccess ?? true
      }
    });

    return ok(plan);
  } catch (error) {
    console.error('[ADMIN_PLANS_POST]', error);
    return serverError('Failed to create plan');
  }
}
