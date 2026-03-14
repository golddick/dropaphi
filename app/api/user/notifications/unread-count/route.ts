// app/api/user/notifications/unread-count/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/respond/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const unreadCount = await db.notification.count({
      where: {
        userId: auth.userId,
        status: 'UNREAD',
      },
    });

    return ok({ unreadCount });
  } catch (error) {
    console.error("[GET_UNREAD_COUNT]", error);
    return err("Failed to fetch unread count", 500);
  }
}