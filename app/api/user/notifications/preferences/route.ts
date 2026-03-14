// app/api/user/notifications/preferences/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { ok, err } from "@/lib/respond/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    let preferences = await db.notificationPreference.findUnique({
      where: { userId: auth.userId },
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await db.notificationPreference.create({
        data: {
          id: dropid('pref'),
          userId: auth.userId,
          emailEnabled: true,
          pushEnabled: true,
          smsEnabled: false,
          inAppEnabled: true,
          quietHoursEnabled: false,
          digestEnabled: false,
          typePreferences: {
            SUBSCRIPTION_EXPIRING: { email: true, push: true },
            PAYMENT_FAILED: { email: true, push: true, sms: true },
            ACCOUNT_LOCKED: { email: true, push: true, sms: true },
          },
        },
      });
    }

    return ok({ preferences });
  } catch (error) {
    console.error("[GET_PREFERENCES]", error);
    return err("Failed to fetch preferences", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const body = await req.json();
    
    // Validate the body
    const allowedFields = [
      'emailEnabled',
      'pushEnabled',
      'smsEnabled',
      'inAppEnabled',
      'quietHoursEnabled',
      'quietHoursStart',
      'quietHoursEnd',
      'quietHoursTimeZone',
      'digestEnabled',
      'digestFrequency',
      'typePreferences',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    const preferences = await db.notificationPreference.upsert({
      where: { userId: auth.userId },
      update: updateData,
      create: {
        id: dropid('pref'),
        userId: auth.userId,
        emailEnabled: body.emailEnabled ?? true,
        pushEnabled: body.pushEnabled ?? true,
        smsEnabled: body.smsEnabled ?? false,
        inAppEnabled: body.inAppEnabled ?? true,
        ...updateData,
      },
    });

    return ok({ preferences });
  } catch (error) {
    console.error("[UPDATE_PREFERENCES]", error);
    return err("Failed to update preferences", 500);
  }
}