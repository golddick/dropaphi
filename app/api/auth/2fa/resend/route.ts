// app/api/auth/2fa/resend/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { err, ok, serverError, validationError } from "@/lib/respond/response";
import { generateOTP, storeOTP, sendOTPEmail } from "@/lib/auth/2fa-utils";

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resendSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { email } = parsed.data;

    // Get user
    const user = await db.user.findUnique({
      where: { email },
      select: { fullName: true, twoFactorEnabled: true },
    });

    if (!user) {
      return err("User not found", 404);
    }

    if (!user.twoFactorEnabled) {
      return err("2FA is not enabled for this account", 400);
    }

    // Generate and send new OTP
    const otp = generateOTP();
    storeOTP(email, otp);
    await sendOTPEmail(email, otp, user.fullName || 'User');

    return ok(null, "New verification code sent");
  } catch (error) {
    console.error("[RESEND_2FA]", error);
    return serverError();
  }
}