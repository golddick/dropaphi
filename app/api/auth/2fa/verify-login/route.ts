// app/api/auth/2fa/verify-login/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { err, ok, serverError, validationError } from "@/lib/respond/response";
import { verifyOTP } from "@/lib/auth/2fa-utils";
import { 
  EXPIRY, 
  setAuthCookies, 
  signAccessToken, 
  signRefreshToken,
  COOKIE 
} from "@/lib/auth/auth-server";

const verifySchema = z.object({
  code: z.string().length(6),
  email: z.string().email(),
  rememberDevice: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { code, email, rememberDevice } = parsed.data;

    // Verify OTP using email as key 
    const isValid = verifyOTP(email, code);
    
    if (!isValid) {
      return err("Invalid or expired verification code", 400);
    }

    // Get user details
    const user = await db.user.findUnique({
      where: { email },
      select: { 
        id: true, 
        email: true, 
        fullName: true,
        twoFactorEnabled: true 
      },
    });

    if (!user) {
      return err("User not found", 404);
    }

    if (!user.twoFactorEnabled) {
      return err("2FA is not enabled for this account", 400);
    }

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

    // Create tokens object for cookie function
    const tokens = {
      accessToken,
      refreshToken: refreshTokenRaw,
      expiresIn: rememberDevice ? 60 * 60 * 24 * 30 : 60 * 15, // 30 days or 15 min
    };

    // ✅ Use your existing setAuthCookies function for consistency
    await setAuthCookies(tokens);

    // Store refresh token in database
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
      message: "2FA verification successful"
    });
  } catch (error) {
    console.error("[2FA_VERIFY_LOGIN]", error);
    return serverError();
  }
}