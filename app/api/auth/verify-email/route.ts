// ============================================================
// DROP API — GET /api/auth/verify-email?token=xxx
// src/app/api/auth/verify-email/route.ts
// ============================================================

import { db } from "@/lib/db";
import { err, ok, serverError } from "@/lib/respond/response";
import { NextRequest, NextResponse } from "next/server";

async function verifyToken(token: string) {
  // Find verification record
  const record = await db.emailVerification.findUnique({
    where: { token },
  });

  if (!record) {
    return { error: 'invalid_token', status: 400, message: "Invalid verification token" };
  }

  if (record.usedAt) {
    return { error: 'token_used', status: 400, message: "This token has already been used" };
  }

  if (record.Verified) {
    return { error: 'already_verified', status: 400, message: "Email is already verified" };
  }

  if (record.expiresAt < new Date()) {
    return { error: 'token_expired', status: 400, message: "Verification token has expired", email: record.email };
  }

  // Use transaction to ensure data consistency
  await db.$transaction(async (tx) => {
    // Mark token as used and verified
    await tx.emailVerification.update({
      where: { id: record.id },
      data: { 
        usedAt: new Date(),
        Verified: true 
      },
    });

    // Activate user
    await tx.user.update({
      where: { email: record.email },
      data: { 
        emailVerified: true, 
        status: "ACTIVE" 
      },
    });

    // Invalidate any other pending verifications
    await tx.emailVerification.updateMany({
      where: { 
        email: record.email,
        id: { not: record.id },
        usedAt: null,
        Verified: false
      },
      data: { usedAt: new Date() }
    });
  });

  return { success: true };
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    
    if (!token) {
      const errorUrl = new URL('/auth/verify-error', req.url);
      errorUrl.searchParams.set('error', 'missing_token');
      return NextResponse.redirect(errorUrl);
    }

    const result = await verifyToken(token);

    if (result.error) {
      const errorUrl = new URL('/auth/verify-error', req.url);
      errorUrl.searchParams.set('error', result.error);
      if (result.email) errorUrl.searchParams.set('email', result.email);
      return NextResponse.redirect(errorUrl);
    }

    // Redirect to success page
    const successUrl = new URL('/auth/verify-success', req.url);
    successUrl.searchParams.set('verified', 'true');
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error("[VERIFY_EMAIL_GET]", error);
    const errorUrl = new URL('/auth/verify-error', req.url);
    errorUrl.searchParams.set('error', 'server_error');
    return NextResponse.redirect(errorUrl);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    
    if (!token) {
      return err("Missing verification token", 400, "MISSING_TOKEN");
    }

    const result = await verifyToken(token);

    if (result.error) {
      return err(result.message, result.status, result.error.toUpperCase());
    }

    return ok("Email verified successfully");

  } catch (error) {
    console.error("[VERIFY_EMAIL_POST]", error);
    return serverError("An error occurred during verification");
  }
}