// app/api/workspace/invitations/[invitationId]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError, unauthorized, notFound } from "@/lib/respond/response";
import { requireAuth } from "@/lib/auth/auth-server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { invitationId: string } }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;
    const { invitationId } = params;

    const invitation = await db.teamInvitation.findUnique({
      where: { id: invitationId }
    });

    if (!invitation) {
      return notFound("Invitation not found");
    }

    // Check if user has permission to cancel
    // Get user's role in the workspace
    const member = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: invitation.workspaceId,
          userId: auth.userId
        }
      }
    });

    const isInviter = invitation.invitedBy === auth.userId;
    const isOwnerOrAdmin = member && (member.role === 'OWNER' || member.role === 'ADMIN');

    if (!isOwnerOrAdmin && !isInviter) {
      return unauthorized("You don't have permission to cancel this invitation");
    }

    await db.teamInvitation.update({
      where: { id: invitationId },
      data: { status: 'CANCELLED' }
    });

    return ok({ message: "Invitation cancelled successfully" });
  } catch (error) {
    console.error("[CANCEL_INVITATION]", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    
    return serverError();
  }
}