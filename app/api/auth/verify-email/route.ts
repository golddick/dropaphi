// ============================================================
// DROP API — GET /api/auth/verify-email?token=xxx
// src/app/api/auth/verify-email/route.ts
// ============================================================

import { db } from "@/lib/db";
import { err, ok, serverError } from "@/lib/respond/response";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    
    if (!token) {
      // Redirect to error page or return error
      const errorUrl = new URL('/verify-error', req.url);
      errorUrl.searchParams.set('error', 'missing_token');
      return Response.redirect(errorUrl.toString(), 302);
      
      // Or if you want JSON response:
      // return err("Missing verification token", 400, "MISSING_TOKEN");
    }

    // Find verification record
    const record = await db.emailVerification.findUnique({
      where: { token },
    });

    if (!record) {
      const errorUrl = new URL('/verify-error', req.url);
      errorUrl.searchParams.set('error', 'invalid_token');
      return Response.redirect(errorUrl.toString(), 302);
    }

    if (record.usedAt) {
      const errorUrl = new URL('/verify-error', req.url);
      errorUrl.searchParams.set('error', 'token_used');
      return Response.redirect(errorUrl.toString(), 302);
    }

    if (record.Verified) {
      const errorUrl = new URL('/verify-error', req.url);
      errorUrl.searchParams.set('error', 'already_verified');
      return Response.redirect(errorUrl.toString(), 302);
    }

    if (record.expiresAt < new Date()) {
      const errorUrl = new URL('/verify-error', req.url);
      errorUrl.searchParams.set('error', 'token_expired');
      errorUrl.searchParams.set('email', record.email);
      return Response.redirect(errorUrl.toString(), 302);
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

    // Redirect to success page
    const successUrl = new URL('/verify-success', req.url);
    successUrl.searchParams.set('verified', 'true');
    return Response.redirect(successUrl.toString(), 302);

  } catch (error) {
    console.error("[VERIFY_EMAIL]", error);
    
    // Redirect to error page for server errors
    const errorUrl = new URL('/verify-error', req.url);
    errorUrl.searchParams.set('error', 'server_error');
    return Response.redirect(errorUrl.toString(), 302);
  }
}