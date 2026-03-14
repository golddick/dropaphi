// app/api/auth/2fa/backup-codes/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { err, ok, serverError } from "@/lib/respond/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { twoFactorBackupCodes: true },
    });

    if (!user?.twoFactorBackupCodes) {
      return err("No backup codes found", 404);
    }

    return ok({ codes: user.twoFactorBackupCodes });
  } catch (error) {
    console.error("[GET_BACKUP_CODES]", error);
    return serverError();
  }
}