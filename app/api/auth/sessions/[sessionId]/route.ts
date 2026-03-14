// app/api/auth/sessions/[sessionId]/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { err, ok, serverError } from "@/lib/respond/response";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    // Don't allow terminating current session
    if (sessionId === auth.sessionId) {
      return err("Cannot terminate current session", 400);
    }

    // Verify session belongs to user
    const session = await db.userSession.findFirst({
      where: {
        id: sessionId,
        userId: auth.userId,
      },
    });

    if (!session) {
      return err("Session not found", 404);
    }

    // Terminate session
    await db.userSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    return ok(null, "Session terminated");
  } catch (error) {
    console.error("[TERMINATE_SESSION]", error);
    return serverError();
  }
}