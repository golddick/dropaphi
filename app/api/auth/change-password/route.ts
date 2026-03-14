// app/api/auth/change-password/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/auth-client";
import { err, ok, serverError, validationError } from "@/lib/respond/response";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    // Get user with password hash
    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { passwordHash: true },
    });

    if (!user?.passwordHash) {
      return err("User not found", 404);
    }

    // Verify current password
    const isValid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!isValid) {
      return err("Current password is incorrect", 401, "INVALID_PASSWORD");
    }

    // Hash new password
    const newPasswordHash = await hashPassword(parsed.data.newPassword);

    // Update password
    await db.user.update({
      where: { id: auth.userId }, 
      data: { passwordHash: newPasswordHash },
    });

    // Optionally: Terminate all other sessions except current
    await db.userSession.updateMany({
      where: {
        userId: auth.userId,
        id: { not: auth.sessionId }
      },
      data: { isActive: false }
    });

    return ok(null, "Password changed successfully");
  } catch (error) {
    console.error("[CHANGE_PASSWORD]", error);
    return serverError();
  }
}



