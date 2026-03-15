



// ============================================================
// DROP API — POST /api/auth/resend-verification
// src/app/api/auth/resend-verification/route.ts
// ============================================================

import { NextRequest } from "next/server";
import { z } from "zod";
import { err, ok, serverError, validationError } from "@/lib/respond/response";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email/auth/email";
import { EXPIRY } from "@/lib/auth/auth-server";
import { generateSecureToken } from "@/lib/auth/auth-client";

const schema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

// Rate-limit: allow resend only every 60 seconds
const RESEND_COOLDOWN_MS = 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { email } = parsed.data;

    // Find user
    const user = await db.user.findUnique({ 
      where: { email },
      select: { 
        emailVerified: true, 
        fullName: true 
      }
    });

    // Always return success to prevent email enumeration
    if (!user || user.emailVerified) {
      return ok(null, "If this email exists and is unverified, a link has been sent");
    }

    // Check for existing valid verification token
    const existingValid = await db.emailVerification.findFirst({
      where: { 
        email,
        usedAt: null,
        Verified: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    // Check cooldown if there's an existing token
    if (existingValid) {
      const elapsed = Date.now() - existingValid.createdAt.getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        const secondsLeft = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return err(
          `Please wait ${secondsLeft}s before requesting another link`,
          429,
          "RATE_LIMITED",
          {
            cooldownRemaining: secondsLeft,
            canResend: false
          }
        );
      }

      // Cooldown passed - we can resend the same token
      // But don't create a new one, just resend the existing
      sendVerificationEmail(email, existingValid.token,)
        .catch(console.error);

      return ok(
        { 
          verificationSent: true,
          message: "Verification email resent"
        }, 
        "Verification email sent"
      );
    }

    // No valid existing token - create a new one
    // First, invalidate any old tokens
    await db.emailVerification.updateMany({
      where: { 
        email, 
        usedAt: null,
        Verified: false 
      },
      data: { usedAt: new Date() }
    });

    // Create new verification token
    const token = generateSecureToken();
    await db.emailVerification.create({
      data: { 
        email, 
        token, 
        expiresAt: EXPIRY.emailVerification(),
        Verified: false,
        usedAt: null
      },
    });

    // Send verification email
    sendVerificationEmail(email, token, )
      .catch(console.error);

    return ok(
      {
        verificationSent: true,
        message: "Verification email sent"
      },
      "Verification email sent"
    );

  } catch (error) {
    console.error("[RESEND_VERIFICATION]", error);
    return serverError();
  }
}