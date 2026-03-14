// app/api/user/notifications/[id]/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/respond/response";

export async function DELETE(
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

    await db.notification.delete({
      where: { id },
    });

    return ok({ message: "Notification deleted" });
  } catch (error) {
    console.error("[DELETE_NOTIFICATION]", error);
    return err("Failed to delete notification", 500);
  }
}