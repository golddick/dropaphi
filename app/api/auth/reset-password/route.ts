// ============================================================
// DROP API — POST /api/auth/reset-password
// src/app/api/auth/reset-password/route.ts
// ============================================================

import { NextRequest } from "next/server";
import { z } from "zod";
import { conflict, err, ok, serverError, validationError } from "@/lib/respond/response";
import { db } from "@/lib/db";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/auth-client";

const schema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { token, password } = parsed.data;

    // 1. Find reset token
    const record = await db.passwordReset.findUnique({ where: { token } });

    if (!record) {
      return err("Invalid password reset link", 400, "INVALID_TOKEN");
    }
    if (record.usedAt) {
      return err("This reset link has already been used", 400, "TOKEN_USED");
    }
    if (record.expiresAt < new Date()) {
      return err("Reset link has expired. Please request a new one.", 400, "TOKEN_EXPIRED");
    }

    // 2. Validate new password strength
    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return conflict(strength.errors.join(", "), "WEAK_PASSWORD");
    }

    // 3. Update password and mark token used (in a transaction)
    const newHash = await hashPassword(password);

    await db.$transaction([
      db.passwordReset.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      db.user.update({
        where: { email: record.email },
        data: { passwordHash: newHash },
      }),
      // Invalidate all sessions and refresh tokens for security
      db.userSession.updateMany({
        where: {
          user: { email: record.email },
          isActive: true,
        },
        data: { isActive: false },
      }),
      db.refreshToken.updateMany({
        where: {
          user: { email: record.email },
          used: false,
        },
        data: { used: true },
      }),
    ]);

    return ok(null, "Password reset successfully. Please log in with your new password.");
  } catch (error) {
    console.error("[RESET_PASSWORD]", error);
    return serverError();
  }
}
