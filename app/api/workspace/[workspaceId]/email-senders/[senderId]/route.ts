// app/api/workspace/[workspaceId]/email-senders/[senderId]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { ok, notFound, serverError, unauthorized } from "@/lib/respond/response";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; senderId: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const { workspaceId, senderId } = await params;

    // Verify user has access to this workspace
    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    });

    if (!member) {
      return unauthorized("You don't have permission to delete email senders");
    }

    // Check if sender exists and belongs to this workspace
    const existingSender = await db.emailSender.findFirst({
      where: {
        id: senderId,
        workspaceId,
      }
    });

    if (!existingSender) {
      return notFound("Email sender not found or already deleted");
    }

    // Delete the email sender
    await db.emailSender.delete({
      where: { id: senderId }
    });

    return ok({ message: "Email sender deleted successfully" });

  } catch (error) {
    console.error("[DELETE_EMAIL_SENDER]", error);
    return serverError();
  }
}