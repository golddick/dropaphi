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

    const user = await db.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user || user.emailVerified) {
      return ok(null, "If this email exists and is unverified, a link has been sent");
    }

    // Check cooldown — find most recent unused verification
    const recent = await db.emailVerification.findFirst({
      where: { email, usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (recent) {
      const elapsed = Date.now() - recent.createdAt.getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        const secondsLeft = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return err(
          `Please wait ${secondsLeft}s before requesting another link`,
          429,
          "RATE_LIMITED"
        );
      }
    }

    // Create new token
    const token = generateSecureToken();
    await db.emailVerification.create({
      data: { email, token, expiresAt: EXPIRY.emailVerification() },
    });

    sendVerificationEmail(email, token).catch(console.error);

    return ok(null, "Verification email sent"); 
  } catch (error) {
    console.error("[RESEND_VERIFICATION]", error);
    return serverError();
  }
}
