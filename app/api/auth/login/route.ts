



















// app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { err, ok, serverError, unauthorized, validationError } from "@/lib/respond/response";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { verifyPassword } from "@/lib/auth/auth-client";
import { EXPIRY, setAuthCookies, signAccessToken, signRefreshToken } from "@/lib/auth/auth-server";
import { generateOTP, sendOTPEmail, storeOTP } from "@/lib/auth/2fa-utils";

// ---- Validation --------------------------------------------
const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, "Password is required"), 
  rememberMe: z.boolean().optional(),
});

// ---- Handler -----------------------------------------------
export async function POST(req: NextRequest) {
  console.log("🚀 [LOGIN API] Started");
  
  try {
    // 1. Parse & validate
    const body = await req.json();
    console.log("📦 Request body:", { ...body, password: "[REDACTED]" });
    
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      console.log("❌ Validation failed:", parsed.error);
      return validationError(parsed.error);
    }

    const { email, password, rememberMe } = parsed.data;

    // 2. Find user
    console.log("🔍 Looking up user:", email);
    const user = await db.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        fullName: true,
        avatarUrl: true,
        emailVerified: true,
        twoFactorEnabled: true,
        status: true,
        timezone: true,
        lastLoginAt: true,
      }
    });

    if (!user) {
      console.log("❌ User not found");
      return unauthorized("Invalid email or password");
    }
    console.log("✅ User found:", user.id);

    // 3. Verify password
    console.log("🔐 Verifying password...");
    const passwordMatch = user.passwordHash
      ? await verifyPassword(password, user.passwordHash)
      : false;

    if (!passwordMatch) {
      return unauthorized("Invalid email or password");
    }

    // 4. Check account status
    if (user.status === "SUSPENDED") {
      console.log("❌ Account suspended");
      return err("Your account has been suspended. Contact support.", 403, "SUSPENDED");
    }

    // 5. Check email verification
    if (!user.emailVerified) {
      console.log("❌ Email not verified");
      return err(
        "Please verify your email before logging in.",
        403,
        "EMAIL_NOT_VERIFIED"
      );
    }

    // 6. CHECK IF 2FA IS ENABLED
    if (user.twoFactorEnabled) {
      console.log("🔐 2FA enabled for user, sending OTP");
      
      // Generate and send OTP
      const otp = generateOTP();
      storeOTP(user.email, otp);
      
      // Send OTP via email
      await sendOTPEmail(user.email, otp, user.fullName || 'User');
      
      // Return that 2FA is required
      return ok({
        requiresTwoFactor: true,
        email: user.email,
        message: "2FA code sent to your email"
      }, "2FA required");
    }

    // 7. Clean up old sessions and tokens
    console.log("🧹 Cleaning up old sessions and tokens");
    await db.$transaction([
      db.userSession.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false }
      }),
      db.refreshToken.deleteMany({
        where: { userId: user.id }
      }),
    ]);

    // 8. Create new session
    console.log("📝 Creating new session");
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
    console.log("✅ Session created:", session.id);

    // 9. Sign tokens
    console.log("🔑 Signing tokens");
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      sessionId: session.id,
    };

    const [accessToken, refreshTokenRaw] = await Promise.all([
      signAccessToken(jwtPayload),
      signRefreshToken(jwtPayload),
    ]); 
    console.log("✅ Tokens signed");

    // 10. Save refresh token to DB (ONCE!)
    console.log("💾 Saving refresh token to DB");
    const refreshTokenRecord = await db.refreshToken.create({
      data: {
        id: dropid('tok'),
        userId: user.id,
        token: refreshTokenRaw,
        expiresAt: EXPIRY.refreshToken(),
      },
    });
    console.log("✅ Refresh token saved with ID:", refreshTokenRecord.id);

    // 11. Set cookies (ONCE!)
    console.log("🍪 Setting cookies");
    await setAuthCookies({
      accessToken,
      refreshToken: refreshTokenRaw,
      expiresIn: rememberMe ? 60 * 60 * 24 * 30 : 60 * 15, // 30 days if remember me, else 15 mins
    });
    console.log("✅ Cookies set");

    // 12. Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 13. Return success
    console.log("✅ Login successful for user:", user.id);
    
    return ok({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        status: user.status,
        timezone: user.timezone,
      },
      tokens: {
        accessToken,
        refreshToken: refreshTokenRaw,
        expiresIn: rememberMe ? 60 * 60 * 24 * 30 : 900,
        tokenType: "Bearer",
      },
    });

  } catch (error) {
    console.error("❌ [LOGIN API] Error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    
    // Return proper JSON error
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}