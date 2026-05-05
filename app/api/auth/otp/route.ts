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
import { createHash, randomInt } from "crypto";
import { err, ok, serverError, validationError } from "@/lib/respond/response";
import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email/auth/email";
import { dropid } from "dropid";
import {EXPIRY, getOptionalSession} from "@/lib/auth/auth-server";

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

const OTP_VALIDITY_MINS = 10;
const DEFAULT_MAX_ATTEMPTS = 3;
const COOLDOWN_MS = 60 * 1000; // 60s between sends

// Generate a numeric OTP on the server (avoid importing any client code)
function generateNumericOtp(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += randomInt(0, 10).toString();
  }
  return code;
}

// ---- POST /api/auth/otp/send --------------------------------
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "send";

  if (action === "send") return handleSend(req);
  if (action === "verify") return handleVerify(req);

  return err("Unknown action. Use ?action=send or ?action=verify", 400);
}

const sendSchema = z
  .object({ email: z.string().email().optional() })
  .optional();

// ---- Send OTP -----------------------------------------------
async function handleSend(req: NextRequest) {
  try {
    const session = await getOptionalSession();
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const parsed = sendSchema.safeParse(body);
    const emailFromBody = parsed.success ? parsed.data?.email : undefined;

    // Accept unauthenticated requests for signup flow; require email in body when unauthenticated
    const email = emailFromBody;
    if (!email) {
      return validationError(
        new z.ZodError([
          {
            code: z.ZodIssueCode.custom,
            message: "email is required",
            path: ["email"],
          },
        ])
      );
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;

    // Rate limit: check last OTP request
    const lastOtp = await db.authOtp.findFirst({
      where: {
        email: email,
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
    const otp = generateNumericOtp(6);
    const otpHash = hashOtp(otp);
    const expiresAt = EXPIRY.otp(OTP_VALIDITY_MINS);

    // Persist OTP request
    await db.authOtp.create({
      data: {
        id: dropid("aotp"),
        email: email,
        otpHash: otpHash,
        expiresAt,
        ipAddress: ip,
      },
    });

    // Send email (non-blocking)
    sendOtpEmail(email, otp, OTP_VALIDITY_MINS).catch(console.error);

    return ok(
      { expiresIn: OTP_VALIDITY_MINS * 60 },
      `OTP sent to ${email}`
    );
  } catch (error) {
    console.error("[OTP_SEND]", error);
    return serverError();
  }
}

// ---- Verify OTP ---------------------------------------------
const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

async function handleVerify(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { code, email } = parsed.data;

    // Find the most recent pending OTP
    const otpRecord = await db.authOtp.findFirst({
      where: {
        email: email,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return err("No active OTP found. Please request a new one.", 400, "NO_ACTIVE_OTP");
    }

    // Check attempt limit
    const maxAttempts = otpRecord.maxAttempts;
    if (otpRecord.attempts >= maxAttempts) {
      await db.authOtp.update({
        where: { id: otpRecord.id },
        data: { status: "FAILED" },
      });
      return err("Too many attempts. Please request a new code.", 400, "MAX_ATTEMPTS");
    }

    // Prepare attempt count post-increment
    const nextAttempts = otpRecord.attempts + 1;

    // Verify hash
    const inputHash = hashOtp(code);
    if (inputHash !== otpRecord.otpHash) {
      const updates: any = { attempts: nextAttempts };
      if (nextAttempts >= maxAttempts) {
        updates.status = "FAILED";
      }
      await db.authOtp.update({ where: { id: otpRecord.id }, data: updates });

      const remaining = Math.max(0, maxAttempts - nextAttempts);
      return err(
        `Invalid code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
        400,
        "INVALID_OTP"
      );
    }

    // Mark as verified
    await db.authOtp.update({
      where: { id: otpRecord.id },
      data: { status: "VERIFIED", verifiedAt: new Date() },
    });

    return ok({ verified: true }, "OTP verified successfully");
  } catch (error) {
    console.error("[OTP_VERIFY]", error);
    return serverError();
  }
}
