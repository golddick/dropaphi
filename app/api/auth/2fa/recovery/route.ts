// app/api/auth/2fa/recovery/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { err, ok, serverError, validationError } from "@/lib/respond/response";
import { verifyBackupCode } from "@/lib/auth/2fa-utils";
import { EXPIRY, setAuthCookies, signAccessToken, signRefreshToken } from "@/lib/auth/auth-server";

const recoverySchema = z.object({
  code: z.string().min(1),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = recoverySchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { code, email } = parsed.data;

    // Get user
    const user = await db.user.findUnique({
      where: { email },
      select: { 
        id: true, 
        email: true, 
        fullName: true,
        twoFactorEnabled: true,
        twoFactorBackupCodes: true 
      },
    });

    if (!user) {
      return err("User not found", 404);
    }

    if (!user.twoFactorEnabled) {
      return err("2FA is not enabled for this account", 400);
    }

    if (!user.twoFactorBackupCodes) {
      return err("No backup codes found", 404);
    }

    // Verify backup code
    const isValid = await verifyBackupCode(code, user.twoFactorBackupCodes);
    
    if (!isValid) {
      return err("Invalid recovery code", 400);
    }

    // Remove the used backup code
    const codes = JSON.parse(user.twoFactorBackupCodes);
    const hashedCode = Buffer.from(code).toString('base64');
    const updatedCodes = codes.filter((c: string) => c !== hashedCode);
    
    await db.user.update({
      where: { id: user.id },
      data: { 
        twoFactorBackupCodes: JSON.stringify(updatedCodes)
      },
    });

    // Clean up old sessions
    await db.$transaction([
      db.userSession.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false }
      }),
      db.refreshToken.deleteMany({
        where: { userId: user.id }
      }),
    ]);

    // Create new session
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? null;
    const userAgent = req.headers.get("user-agent") ?? null;

    const session = await db.userSession.create({
      data: {
        id: dropid('ses'),
        userId: user.id,
        ipAddress: ip,
        userAgent,
        expiresAt: EXPIRY.session(),
        isActive: true,
      },
    });

    // Sign tokens
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      sessionId: session.id,
    };

    const [accessToken, refreshTokenRaw] = await Promise.all([
      signAccessToken(jwtPayload),
      signRefreshToken(jwtPayload),
    ]);

    const tokens = {
      accessToken,
      refreshToken: refreshTokenRaw,
      expiresIn: 60 * 15,
    };

    // Set cookies
    await setAuthCookies(tokens);

    // Store refresh token
    await db.refreshToken.create({
      data: {
        id: dropid('tok'),
        userId: user.id,
        token: refreshTokenRaw,
        expiresAt: EXPIRY.refreshToken(),
      },
    });

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return ok({ 
      success: true,
      message: "Recovery code verified successfully" 
    });
  } catch (error) {
    console.error("[RECOVERY_CODE]", error);
    return serverError();
  }
}