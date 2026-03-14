// app/api/auth/refresh/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { dropid } from "dropid";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(COOKIE.REFRESH_TOKEN)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token" },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // Check if refresh token exists in database
    const storedToken = await db.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt: { gt: new Date() }
      }
    });

    if (!storedToken) {
      return NextResponse.json(
        { error: "Refresh token expired" },
        { status: 401 }
      );
    }

    // Create new session
    const session = await db.userSession.create({
      data: {
        id: dropid('ses'),
        userId: payload.userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });

    // Sign new tokens
    const jwtPayload = {
      userId: payload.userId,
      email: payload.email,
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
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Create response
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    // Set new cookies
    const isProd = process.env.NODE_ENV === "production";
    
    response.cookies.set(COOKIE.ACCESS_TOKEN, newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    response.cookies.set(COOKIE.REFRESH_TOKEN, newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Refresh API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}






// // ============================================================
// // DROP API — POST /api/auth/refresh
// // src/app/api/auth/refresh/route.ts
// // ============================================================

// import { NextRequest } from "next/server";
// import { z } from "zod";
// import { ok, serverError, unauthorized, validationError } from "@/lib/respond/response";
// import { db } from "@/lib/db";
// import { dropid } from "dropid";
// import { EXPIRY, signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/auth/auth-server";

// const schema = z.object({
//   refreshToken: z.string().min(1),
// });

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const parsed = schema.safeParse(body);
//     if (!parsed.success) return validationError(parsed.error);

//     const { refreshToken } = parsed.data;

//     // 1. Verify JWT
//     const payload = await verifyRefreshToken(refreshToken);
//     if (!payload) return unauthorized("Invalid or expired refresh token");

//     // 2. Find token record (tok_xxx) — must not be used/expired
//     const tokenRecord = await db.refreshToken.findUnique({
//       where: { token: refreshToken },
//     });

//     if (!tokenRecord || tokenRecord.used || tokenRecord.expiresAt < new Date()) {
//       return unauthorized("Refresh token is invalid or has been revoked");
//     }

//     // 3. Validate user still exists and is active
//     const user = await db.user.findUnique({ where: { id: payload.userId } });
//     if (!user || user.status === "SUSPENDED") {
//       return unauthorized("Account not accessible");
//     }

//     // 4. Rotate: mark old token as used
//     await db.refreshToken.update({
//       where: { id: tokenRecord.id },
//       data: { used: true },
//     });

//     // 5. Issue new token pair
//     const jwtPayload = {
//       userId: user.id,
//       email: user.email,
//       sessionId: payload.sessionId,
//     };

//     const [newAccessToken, newRefreshToken] = await Promise.all([
//       signAccessToken(jwtPayload),
//       signRefreshToken(jwtPayload),
//     ]);

//     // 6. Persist new refresh token (tok_xxx)
//     await db.refreshToken.create({
//       data: {
//         id: dropid('tok'),
//         userId: user.id,
//         token: newRefreshToken,
//         expiresAt: EXPIRY.refreshToken(),
//       },
//     });

//     return ok({
//       accessToken: newAccessToken,
//       refreshToken: newRefreshToken,
//       expiresIn: 900,
//       tokenType: "Bearer",
//     });
//   } catch (error) {
//     console.error("[REFRESH]", error);
//     return serverError();
//   }
// }
