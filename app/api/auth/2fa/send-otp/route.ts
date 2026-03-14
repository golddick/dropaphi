// app/api/auth/2fa/send-otp/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { err, ok, serverError } from "@/lib/respond/response";
import { generateOTP, storeOTP, sendOTPEmail } from "@/lib/auth/2fa-utils";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    // Get user details
    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { email: true, fullName: true, twoFactorEnabled: true },
    });

    if (!user) {
      return err("User not found", 404);
    }

    if (user.twoFactorEnabled) {
      return err("2FA is already enabled", 400);
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with user's email as key
    storeOTP(user.email, otp);
    
    // Send OTP via email
    await sendOTPEmail(user.email, otp, user.fullName || 'User');

    console.log(`✅ 2FA OTP sent to ${user.email}`);

    return ok(null, "OTP sent to your email");
  } catch (error) {
    console.error("[SEND_2FA_OTP]", error);
    return serverError();
  }
}