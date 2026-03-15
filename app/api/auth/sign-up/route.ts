


// ============================================================
// DROP API — POST /api/auth/sign-up
// src/app/api/auth/sign-up/route.ts
// ============================================================

import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { conflict, ok, serverError, validationError } from "@/lib/respond/response";
import { sendVerificationEmail } from "@/lib/email/auth/email";
import { dropid } from "dropid";
import { generateSecureToken, hashPassword, validatePasswordStrength } from "@/lib/auth/auth-client";
import { EXPIRY } from "@/lib/auth/auth-server";

// ---- Validation --------------------------------------------
const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ---- Handler -----------------------------------------------
export async function POST(req: NextRequest) {
  try {
    // 1. Parse & validate body
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { fullName, email, password } = parsed.data;

    // 2. Check password strength
    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return conflict(strength.errors.join(", "), "WEAK_PASSWORD");
    }

    // 3. Check if email already taken
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return conflict(
        "An account with this email already exists",
        "EMAIL_TAKEN"
      );
    }

    // 4. Create user
    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        id: dropid('user'),
        fullName,
        email,
        passwordHash,
        status: "PENDING_VERIFICATION",
        emailVerified: false,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    // 5. Create email verification token
    // First, invalidate any existing tokens for this email
    await db.emailVerification.updateMany({
      where: { 
        email, 
        usedAt: null,
        Verified: false 
      },
      data: { usedAt: new Date() }
    });

    const token = generateSecureToken();
    await db.emailVerification.create({
      data: {
        id: dropid('ev'),
        email,
        token,
        expiresAt: EXPIRY.emailVerification(),
        Verified: false,
        usedAt: null
      },
    });

    // 6. Send verification email (non-blocking)
    sendVerificationEmail(email, token).catch(console.error);

    return ok(
      {
        user,
        message: "Check your email to verify your account",
      },
      "Account created successfully",
      201
    );
  } catch (error) {
    console.error("[SIGNUP]", error);
    return serverError();
  }
}