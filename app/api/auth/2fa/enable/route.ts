// app/api/auth/2fa/enable/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { err, ok, serverError, validationError } from "@/lib/respond/response";
import { verifyOTP, generateBackupCodes, hashBackupCode } from "@/lib/auth/2fa-utils";

const enableSchema = z.object({
  code: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const parsed = enableSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    // Get user email
    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!user) {
      return err("User not found", 404);
    }

    if (user.twoFactorEnabled) {
      return err("2FA is already enabled", 400);
    }

    // Verify OTP
    const isValid = verifyOTP(user.email, parsed.data.code);
    
    if (!isValid) {
      return err("Invalid or expired OTP code", 400);
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => hashBackupCode(code))
    );

    // Enable 2FA for user
    await db.user.update({
      where: { id: auth.userId },
      data: { 
        twoFactorEnabled: true,
        twoFactorBackupCodes: JSON.stringify(hashedBackupCodes),
      },
    });

    return ok({ 
      backupCodes, // Send plain codes for user to save
      message: "2FA enabled successfully" 
    });
  } catch (error) {
    console.error("[ENABLE_2FA]", error);
    return serverError();
  }
}