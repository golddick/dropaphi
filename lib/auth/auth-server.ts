
// lib/auth/auth-server.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { redirect } from "next/navigation";

// ---- Secrets & Config --------------------------------------
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-in-production"
);
const ACCESS_TOKEN_TTL = "2d";
const REFRESH_TOKEN_TTL = "30d";

// ---- Types -------------------------------------------------
export interface JwtPayload {
  userId: string;   // usr_xxx
  email: string;
  sessionId: string; // ses_xxx
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

// ---- Cookie Names ------------------------------------------
export const COOKIE = {
  ACCESS_TOKEN: "da_access",
  REFRESH_TOKEN: "da_refresh",
} as const;

// ---- JWT ---------------------------------------------------
export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .setIssuer("dropapi")
    .setAudience("dropapi-dashboard")
    .sign(JWT_SECRET);
}

export async function signRefreshToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_TTL)
    .setIssuer("dropapi")
    .setAudience("dropapi-refresh")
    .sign(JWT_SECRET);
}

export async function verifyAccessToken(
  token: string
): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "dropapi",
      audience: "dropapi-dashboard",
    });
    return payload as unknown as JwtPayload;
  } catch (error) {
    console.error("[verifyAccessToken] Error:", error);
    return null;
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "dropapi",
      audience: "dropapi-refresh",
    });
    return payload as unknown as JwtPayload;
  } catch (error) {
    console.error("[verifyRefreshToken] Error:", error);
    return null;
  }
}

// ---- Cookie Helpers ----------------------------------------

export async function setAuthCookies(tokens: AuthTokens) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  // First, delete any existing cookies to clean up
  cookieStore.delete(COOKIE.ACCESS_TOKEN);
  cookieStore.delete(COOKIE.REFRESH_TOKEN);

  // Set new access token
  cookieStore.set(COOKIE.ACCESS_TOKEN, tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: tokens.expiresIn,
    path: "/",
  });

  // Set new refresh token with explicit path
  cookieStore.set(COOKIE.REFRESH_TOKEN, tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/", // ALWAYS use root path
  });
}


export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE.ACCESS_TOKEN);
  cookieStore.delete(COOKIE.REFRESH_TOKEN);
}

// ---- Extract token from request ----------------------------
export function extractToken(req: NextRequest): string | null {
  // 1. Authorization: Bearer <token>
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  // 2. Cookie
  return req.cookies.get(COOKIE.ACCESS_TOKEN)?.value ?? null;
}

// ---- Calculate expiry dates --------------------------------
export const EXPIRY = {
  accessToken: () => new Date(Date.now() + 15 * 60 * 1000),           // 15 min
  refreshToken: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  emailVerification: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hrs
  passwordReset: () => new Date(Date.now() + 60 * 60 * 1000),          // 1 hr
  otp: (mins: number) => new Date(Date.now() + mins * 60 * 1000),
  session: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),      // 30 days
};

// ---- Session helpers (for server components) ---------------
export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(COOKIE.ACCESS_TOKEN)?.value;
    
    if (!accessToken) {
      console.log('[getServerSession] No access token found');
      return null;
    }

    const payload = await verifyAccessToken(accessToken);
    
    if (payload) {
      console.log('[getServerSession] Valid access token for user:', payload.userId);
      return payload;
    }
    
    console.log('[getServerSession] Access token expired or invalid');
    return null;
  } catch (error) {
    console.error('[getServerSession] Error:', error);
    return null;
  }
}


export async function refreshAccessToken() {
  try {
    const cookieStore = await cookies();
    const refreshTokenRaw = cookieStore.get(COOKIE.REFRESH_TOKEN)?.value;
    const refreshToken = refreshTokenRaw?.trim();
    
    if (!refreshToken) {
      console.log('[refreshAccessToken] No refresh token found');
      return null;
    }

    console.log('[refreshAccessToken] Found refresh token, verifying...');

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      console.log('[refreshAccessToken] Invalid refresh token');
      return null;
    }

    console.log('[refreshAccessToken] Valid refresh token for user:', payload.userId);

    // Check if refresh token exists in database
    const storedToken = await db.refreshToken.findFirst({
      where: {
        // token: refreshToken,
        userId: payload.userId,
        expiresAt: { gt: new Date() }
      }
    });

    console.log("[RT DEBUG]", {
    cookieToken: refreshToken,
    dbToken: storedToken?.token,
    equal: refreshToken === storedToken?.token,
  });

    if (!storedToken) {
      console.log('[refreshAccessToken] Refresh token not found in database');
      return null;
    }

    // Get user from database to ensure they exist
    const user = await db.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      console.log('[refreshAccessToken] User not found:', payload.userId);
      return null;
    }

    // Create new session in database
    const session = await db.userSession.create({
      data: {
        id: dropid('ses'),
        userId: payload.userId,
        expiresAt: EXPIRY.session(),
        isActive: true,
        ipAddress: 'unknown',
        userAgent: 'unknown',
        lastActiveAt: new Date(),
      },
    });

    console.log('[refreshAccessToken] Created new session:', session.id);

    // Sign new tokens
    const jwtPayload = {
      userId: payload.userId,
      email: payload.email || user.email,
      sessionId: session.id,
    };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      signAccessToken(jwtPayload),
      signRefreshToken(jwtPayload),
    ]);

    // Update refresh token in database
    await db.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        token: newRefreshToken,
        expiresAt: EXPIRY.refreshToken(),
      },
    });

    // Set new cookies
    const isProd = process.env.NODE_ENV === "production";
    
    cookieStore.set({
      name: COOKIE.ACCESS_TOKEN,
      value: newAccessToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    cookieStore.set({
      name: COOKIE.REFRESH_TOKEN,
      value: newRefreshToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    console.log('[refreshAccessToken] Successfully refreshed tokens');
    console.log(
  "[refreshAccessToken] Comparing tokens:",
  {
    cookieToken: refreshToken.slice(0, 25),
    dbToken: storedToken?.token?.slice(0, 25),
  }
); 
    
    // Verify and return new session
    const newPayload = await verifyAccessToken(newAccessToken);
    return newPayload;
  } catch (error) {
    console.error('[refreshAccessToken] Error:', error);
    return null;
  }
}


export async function requireAuth() {
  console.log('[requireAuth] Starting authentication check');
  
  const cookieStore = await cookies();
  
  // Log all cookie names (not values for security)
  const cookieNames = cookieStore.getAll().map(c => c.name);
  console.log('[requireAuth] Cookies present:', cookieNames);
  
  // Get access token from cookie
  const accessToken = cookieStore.get(COOKIE.ACCESS_TOKEN)?.value;
  
  if (!accessToken) {
    console.log('[requireAuth] No access token found in cookies');
    
    // Try to refresh if no access token
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return refreshed;
    }
    
    return new Response(
      JSON.stringify({ error: 'Unauthorized - No access token' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  console.log('[requireAuth] Access token found, verifying...');
  
  // Verify access token
  const payload = await verifyAccessToken(accessToken);
  
  if (!payload) {
    console.log('[requireAuth] Access token invalid, attempting refresh');
    
    // Try to refresh if access token is invalid
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return refreshed;
    }
    
    return new Response(
      JSON.stringify({ error: 'Unauthorized - Invalid token' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  console.log('[requireAuth] Authenticated user:', payload.userId);
  return payload;
}

// For API routes that need to check authentication without throwing
export async function getOptionalSession() {
  const session = await getServerSession();
  if (session) return session;
  
  // Try to refresh if no session
  return await refreshAccessToken();
}

export async function requireGuest() {
  const user = await getServerSession();
  
  if (user) {
    redirect('/dashboard');
  }
}

