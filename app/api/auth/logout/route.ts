// ============================================================
// DROP API — POST /api/auth/logout
// src/app/api/auth/logout/route.ts
// ============================================================

import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";
import { NextRequest } from "next/server";


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

    return ok(null, "Logged out successfully");
  } catch (error) {
    console.error("[LOGOUT]", error);
    return serverError();
  }
}
