// ============================================================
// DROP API — POST /api/auth/logout
// src/app/api/auth/logout/route.ts
// ============================================================

import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";
import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "da_access";
const REFRESH_COOKIE = "da_refresh";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    // Invalidate the session
    await db.userSession.update({
      where: { id: auth.sessionId },
      data: { isActive: false },
    });

    // Optionally revoke ALL refresh tokens for this session
    const body = await req.json().catch(() => ({}));
    if (body.allDevices) {
      await db.refreshToken.updateMany({
        where: { userId: auth.userId, used: false },
        data: { used: true },
      });
    }

    // Create response with cookie clearing
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear cookies by setting expired dates
    response.cookies.set(ACCESS_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Expire immediately
      expires: new Date(0), // Set to epoch
    });

    response.cookies.set(REFRESH_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    // Also clear any other auth-related cookies if they exist
    response.cookies.set("da_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("[LOGOUT]", error);
    return serverError();
  }
}