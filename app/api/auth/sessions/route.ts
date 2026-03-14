





// ============================================================
// DROP API — GET    /api/auth/sessions → list sessions
//            DELETE /api/auth/sessions → revoke session(s)
// src/app/api/auth/sessions/route.ts
// ============================================================

import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { err, ok, serverError, validationError } from "@/lib/respond/response";
import { NextRequest } from "next/server";
import { z } from "zod";


// ---- GET: list all active sessions -------------------------
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;
 
    const sessions = await db.userSession.findMany({
      where: { userId: auth.userId, isActive: true },
      orderBy: { lastActiveAt: "desc" },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        deviceInfo: true,
        lastActiveAt: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    console.log("Sessions for user", auth.userId, sessions);

    return ok(sessions);
  } catch (error) {
    console.error("[LIST_SESSIONS]", error);
    return serverError();
  }
}

// ---- DELETE: revoke a specific session or all others -------
const schema = z.object({
  sessionId: z.string().optional(), // if omitted, revokes all except current
  revokeAll: z.boolean().optional().default(false),
});

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { sessionId, revokeAll } = parsed.data;

    if (revokeAll) {
      // Revoke all sessions except current
      await db.userSession.updateMany({
        where: {
          userId: auth.userId,
          isActive: true,
          id: { not: auth.sessionId },
        },
        data: { isActive: false },
      });
      return ok(null, "All other sessions revoked");
    }

    if (sessionId) {
      // Cannot revoke current session via this endpoint
      if (sessionId === auth.sessionId) {
        return err("Use /api/auth/logout to end current session", 400);
      }

      const session = await db.userSession.findFirst({
        where: { id: sessionId, userId: auth.userId },
      });
      if (!session) return err("Session not found", 404, "NOT_FOUND");

      await db.userSession.update({
        where: { id: sessionId },
        data: { isActive: false },
      });

      return ok(null, "Session revoked");
    }

    return err("Provide sessionId or revokeAll:true", 400);
  } catch (error) {
    console.error("[REVOKE_SESSION]", error);
    return serverError();
  }
}
