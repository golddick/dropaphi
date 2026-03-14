// ============================================================
// DROP API — POST /api/auth/forgot-password
// src/app/api/auth/forgot-password/route.ts
// ============================================================

import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, serverError, validationError } from "@/lib/respond/response";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email/auth/email";
import { generateSecureToken } from "@/lib/auth/auth-client";
import { EXPIRY } from "@/lib/auth/auth-server";

const schema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

const COOLDOWN_MS = 60 * 1000; // 60 seconds between requests

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { email } = parsed.data;

    // Always respond with success to prevent email enumeration
    const user = await db.user.findUnique({ where: { email } });

    if (user) {
      // Check cooldown
      const recent = await db.passwordReset.findFirst({
        where: { email, usedAt: null },
        orderBy: { createdAt: "desc" },
      });

      const shouldSend =
        !recent || Date.now() - recent.createdAt.getTime() >= COOLDOWN_MS;

      if (shouldSend) {
        const token = generateSecureToken();
        await db.passwordReset.create({
          data: { email, token, expiresAt: EXPIRY.passwordReset() },
        });
        sendPasswordResetEmail(email, token).catch(console.error);
      }
    }

    return ok(
      null,
      "If an account with that email exists, a reset link has been sent"
    );
  } catch (error) {
    console.error("[FORGOT_PASSWORD]", error);
    return serverError();
  }
}
