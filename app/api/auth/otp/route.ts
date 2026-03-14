// ============================================================
// DROP API — POST /api/auth/otp/send
//            POST /api/auth/otp/verify
// src/app/api/auth/otp/route.ts
//
// This handles two-factor auth OTPs via email.
// For API service OTPs (sent to end-users), see /api/services/otp
// ============================================================

import { NextRequest } from "next/server";
import { z } from "zod";
import { createHash } from "crypto";
import { err, ok, serverError, validationError } from "@/lib/respond/response";
import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email/auth/email";
import { dropid } from "dropid";
import { generateOtp } from "@/lib/auth/auth-client";
import { EXPIRY, requireAuth } from "@/lib/auth/auth-server";

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

const OTP_VALIDITY_MINS = 10;
const MAX_ATTEMPTS = 3;
const COOLDOWN_MS = 60 * 1000; // 60s between sends

// ---- POST /api/auth/otp/send --------------------------------
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "send";

  if (action === "send") return handleSend(req);
  if (action === "verify") return handleVerify(req);

  return err("Unknown action. Use ?action=send or ?action=verify", 400);
}

// ---- Send OTP -----------------------------------------------
async function handleSend(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;


    // Rate limit: check last OTP request
    const lastOtp = await db.otpRequest.findFirst({
      where: {
        recipient: auth.email,
        channel: "EMAIL",
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });

    if (lastOtp) {
      const elapsed = Date.now() - lastOtp.createdAt.getTime();
      if (elapsed < COOLDOWN_MS) {
        const secs = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        return err(`Wait ${secs}s before requesting a new code`, 429, "RATE_LIMITED");
      }
    }

    // Generate OTP
    const otp = generateOtp(6);
    const otpHash = hashOtp(otp);
    const expiresAt = EXPIRY.otp(OTP_VALIDITY_MINS);

    // Find workspaceId — use first workspace the user belongs to
    // For auth OTPs we use a system workspace
    const member = await db.workspaceMember.findFirst({
      where: { userId: auth.userId },
    });

    if (!member) {
      // Create minimal OTP record without workspace
      // In production you'd have a system workspace
      await db.otpRequest.create({
        data: {
          workspaceId: dropid('ws'), // Replace with actual system workspace ID
          channel: "EMAIL",
          recipient: auth.email,
          otpHash,
          validityMins: OTP_VALIDITY_MINS,
          expiresAt,
          creditsUsed: 0,
          source: "auth",
          status: "PENDING",
        },
      });
    } else {
      await db.otpRequest.create({
        data: {
          workspaceId: member.workspaceId,
          channel: "EMAIL",
          recipient: auth.email,
          otpHash,
          validityMins: OTP_VALIDITY_MINS,
          expiresAt,
          creditsUsed: 0,
          source: "auth",
          status: "PENDING",
        },
      });
    }

    // Send email (non-blocking)
    sendOtpEmail(auth.email, otp, OTP_VALIDITY_MINS).catch(console.error);

    return ok(
      { expiresIn: OTP_VALIDITY_MINS * 60 },
      `OTP sent to ${auth.email}`
    );
  } catch (error) {
    console.error("[OTP_SEND]", error);
    return serverError();
  }
}

// ---- Verify OTP ---------------------------------------------
const verifySchema = z.object({ code: z.string().length(6) });

async function handleVerify(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { code } = parsed.data;

    // Find the most recent pending OTP
    const otpRecord = await db.otpRequest.findFirst({
      where: {
        recipient: auth.email,
        channel: "EMAIL",
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return err("No active OTP found. Please request a new one.", 400, "NO_ACTIVE_OTP");
    }

    // Check attempt limit
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      await db.otpRequest.update({
        where: { id: otpRecord.id },
        data: { status: "FAILED" },
      });
      return err("Too many attempts. Please request a new code.", 400, "MAX_ATTEMPTS");
    }

    // Increment attempts
    await db.otpRequest.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    // Verify hash
    const inputHash = hashOtp(code);
    if (inputHash !== otpRecord.otpHash) {
      const remaining = MAX_ATTEMPTS - (otpRecord.attempts + 1);
      return err(
        `Invalid code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
        400,
        "INVALID_OTP"
      );
    }

    // Mark as verified
    await db.otpRequest.update({
      where: { id: otpRecord.id },
      data: { status: "VERIFIED", verifiedAt: new Date() },
    });

    return ok({ verified: true }, "OTP verified successfully");
  } catch (error) {
    console.error("[OTP_VERIFY]", error);
    return serverError();
  }
}
