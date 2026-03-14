// ============================================================
// DROP API — POST /api/auth/verify-email
//            POST /api/auth/resend-verification
// src/app/api/auth/verify-email/route.ts
// ============================================================

import { db } from "@/lib/db";
import { err, ok, serverError, validationError } from "@/lib/respond/response";
import { NextRequest } from "next/server";
import { z } from "zod";


// ---- Verify email with token --------------------------------
const verifySchema = z.object({ token: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { token } = parsed.data;

    // Find verification record
    const record = await db.emailVerification.findUnique({
      where: { token },
    }); 

    if (!record) {
      return err("Invalid verification token", 400, "INVALID_TOKEN");
    }

    if (record.usedAt) {
      return err("This verification link has already been used", 400, "TOKEN_USED");
    }

    if (record.expiresAt < new Date()) {
      return err("Verification link has expired. Request a new one.", 400, "TOKEN_EXPIRED");
    }

    // Mark token as used
    await db.emailVerification.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    // Activate user
    const user = await db.user.update({
      where: { email: record.email },
      data: { emailVerified: true, status: "ACTIVE" },
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerified: true,
        status: true,
      },
    });

    return ok(user, "Email verified successfully");
  } catch (error) {
    console.error("[VERIFY_EMAIL]", error);
    return serverError();
  }
}
