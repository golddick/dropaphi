// app/api/user/notifications/[id]/archive/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/respond/response";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const { id } = params;

    const notification = await db.notification.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
    });

    if (!notification) {
      return err("Notification not found", 404);
    }

    await db.notification.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        archivedAt: new Date(),
      },
    });

    return ok({ message: "Notification archived" });
  } catch (error) {
    console.error("[ARCHIVE_NOTIFICATION]", error);
    return err("Failed to archive notification", 500);
  }
}