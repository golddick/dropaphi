
// app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { err, ok, serverError, unauthorized, validationError } from "@/lib/respond/response";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { verifyPassword, generateSecureToken } from "@/lib/auth/auth-client";
import { EXPIRY, setAuthCookies, signAccessToken, signRefreshToken } from "@/lib/auth/auth-server";
import { sendVerificationEmail } from "@/lib/email/auth/email";
import { generateOTP, sendOTPEmail, storeOTP } from "@/lib/auth/2fa-utils";

// ---- Validation --------------------------------------------
const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, "Password is required"), 
  rememberMe: z.boolean().optional(),
});

// Rate-limit: allow resend only every 60 seconds
const RESEND_COOLDOWN_MS = 60 * 1000;

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

    // 2. Find user with all needed fields
    console.log("🔍 Looking up user:", email);
    const user = await db.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        passwordHash: true,
        emailVerified: true,
        twoFactorEnabled: true,
        status: true,
        timezone: true,
        avatarUrl: true,
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

    // 5. CHECK EMAIL VERIFICATION - BLOCK LOGIN IF NOT VERIFIED
    if (!user.emailVerified) {
      console.log("❌ Email not verified - checking for existing verification token");
      
      // Check for existing UNUSED verification token
      const existingVerification = await db.emailVerification.findFirst({
        where: { 
          email: user.email,
          usedAt: null,        // Not used yet
          Verified: false,      // Not verified
          expiresAt: { gt: new Date() } // Not expired
        },
        orderBy: { createdAt: "desc" }
      });

      let cooldownRemaining = 0;
      let token = null;

      if (existingVerification) {
        // Check cooldown
        const elapsed = Date.now() - existingVerification.createdAt.getTime();
        if (elapsed < RESEND_COOLDOWN_MS) {
          cooldownRemaining = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
          token = existingVerification.token; // Use existing token
        }
      }

      // If no valid existing token or cooldown passed, create new one
      if (!token) {
        // Invalidate old tokens
        await db.emailVerification.updateMany({
          where: { 
            email: user.email,
            usedAt: null,
            Verified: false
          },
          data: { 
            usedAt: new Date() // Mark as used so they can't be used again
          }
        });

        // Create new verification token
        token = generateSecureToken();
        await db.emailVerification.create({
          data: { 
            email: user.email,
            token,
            expiresAt: EXPIRY.emailVerification(),
            Verified: false,
            usedAt: null
          },
        });

        // Send verification email (fire and forget)
        // sendVerificationEmail(user.email, token, user.fullName || 'User')
        sendVerificationEmail(user.email, token, )
          .catch(err => console.error("Failed to send verification email:", err));
        
        console.log("✅ New verification email sent to:", user.email);
      } else {
        // Use existing valid token - resend the same email
        sendVerificationEmail(user.email, token, )
          .catch(err => console.error("Failed to resend verification email:", err));
        
        console.log("✅ Existing verification email resent to:", user.email);
      }

      // Return error with verification info
      return err(
        cooldownRemaining > 0
          ? `Please verify your email before logging in. A verification link was recently sent. You can request another in ${cooldownRemaining} seconds.`
          : "Please verify your email before logging in. A verification link has been sent to your email.",
        403,
        "EMAIL_NOT_VERIFIED",
        {
          email: user.email,
          verificationSent: true,
          cooldownRemaining,
          canResend: cooldownRemaining === 0
        }
      );
    }

    // 6. CHECK IF 2FA IS ENABLED (only for verified users)
    if (user.twoFactorEnabled) {
      console.log("🔐 2FA enabled for user, sending OTP");
      
      const otp = generateOTP();
      await storeOTP(user.email, otp);
      
      // Send OTP via email
      await sendOTPEmail(user.email, otp, user.fullName || 'User');
      
      // Return that 2FA is required
      return ok({
        requiresTwoFactor: true,
        email: user.email,
        message: "2FA code sent to your email"
      }, "2FA required");
    }

    // 7. Clean up old sessions and tokens (only for verified users)
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

    // 10. Save refresh token to DB
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

    // 11. Set cookies
    console.log("🍪 Setting cookies");
    await setAuthCookies({
      accessToken,
      refreshToken: refreshTokenRaw,
      expiresIn: rememberMe ? 60 * 60 * 24 * 30 : 60 * 15,
    });
    console.log("✅ Cookies set");

    // 12. Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 13. Return success for verified users
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