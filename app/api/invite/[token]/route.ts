




// app/api/invite/[token]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError, notFound, err } from "@/lib/respond/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // IMPORTANT: Await the params Promise
    const { token } = await params;
    
    if (!token) {
      return err("Invitation token is required", 400);
    }

    console.log('Looking up invitation with token:', token);

    // Find the invitation by token
    const invitation = await db.teamInvitation.findFirst({
      where: {
        token: token,
        status: 'PENDING'
      }
    });

    if (!invitation) {
      return notFound("Invitation not found or already accepted");
    }

    // Get workspace details
    const workspace = await db.workspace.findUnique({
      where: { id: invitation.workspaceId },
      select: {
        name: true,
        slug: true,
        logoUrl: true
      }
    });

    if (!workspace) {
      return notFound("Workspace not found");
    }

    // Get inviter details
    const inviter = await db.user.findUnique({
      where: { id: invitation.invitedBy },
      select: {
        fullName: true,
        email: true
      }
    });

    if (!inviter) {
      return notFound("Inviter not found");
    }

    // Check if expired
    const isExpired = invitation.expiresAt < new Date();

    return ok({
      id: invitation.id,
      token: invitation.token,
      workspaceId: invitation.workspaceId,
      workspaceName: workspace.name,
      workspaceSlug: workspace.slug,
      workspaceLogo: workspace.logoUrl,
      inviterName: inviter.fullName || inviter.email,
      inviterEmail: inviter.email,
      invitedEmail: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      isExpired
    });
  } catch (error) {
    console.error("[GET_INVITATION]", error);
    return serverError();
  }
}