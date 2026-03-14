// app/api/auth/2fa/backup-codes/regenerate/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { err, ok, serverError } from "@/lib/respond/response";
import { generateBackupCodes, hashBackupCode } from "@/lib/auth/2fa-utils";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    // Check if 2FA is enabled
    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { twoFactorEnabled: true },
    });

    if (!user?.twoFactorEnabled) {
      return err("2FA is not enabled", 400);
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => hashBackupCode(code))
    );

    // Update user with new backup codes
    await db.user.update({
      where: { id: auth.userId },
      data: {
        twoFactorBackupCodes: JSON.stringify(hashedBackupCodes),
      },
    });

    return ok({ 
      codes: backupCodes, // Send plain codes for user to save
      message: "Backup codes regenerated successfully" 
    });
  } catch (error) {
    console.error("[REGENERATE_BACKUP_CODES]", error);
    return serverError();
  }
}