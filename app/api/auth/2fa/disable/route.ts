// app/api/auth/2fa/disable/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/auth-client";
import { err, ok, serverError, validationError } from "@/lib/respond/response";

const disableSchema = z.object({
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const parsed = disableSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    // Verify password
    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { passwordHash: true },
    });

    if (!user?.passwordHash) {
      return err("User not found", 404);
    }

    const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!isValid) {
      return err("Invalid password", 401);
    }

    // Disable 2FA
    await db.user.update({
      where: { id: auth.userId },
      data: {
        twoFactorEnabled: false,
        twoFactorBackupCodes: null,
      },
    });

    return ok(null, "2FA disabled successfully");
  } catch (error) {
    console.error("[DISABLE_2FA]", error);
    return serverError();
  }
}