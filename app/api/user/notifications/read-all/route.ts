// app/api/user/notifications/read-all/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/respond/response";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    await db.notification.updateMany({
      where: {
        userId: auth.userId,
        status: 'UNREAD',
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });

    return ok({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("[MARK_ALL_READ]", error);
    return err("Failed to mark all notifications as read", 500);
  }
}