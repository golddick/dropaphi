// app/api/invite/[token]/accept/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError, unauthorized, notFound, err } from "@/lib/respond/response";
import { requireAuth } from "@/lib/auth/auth-server";
import { dropid } from "dropid";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // IMPORTANT: Await the params Promise
    const { token } = await params;

    if (!token) {
      return err("Invitation token is required", 400);
    }

    console.log('Accepting invitation with token:', token);

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

    // Check if expired
    if (invitation.expiresAt < new Date()) {
      return err("Invitation has expired", 410, "EXPIRED");
    }

    // Get workspace details
    const workspace = await db.workspace.findUnique({
      where: { id: invitation.workspaceId },
      select: { 
        id: true,
        name: true,
        slug: true 
      }
    });

    if (!workspace) {
      return notFound("Workspace not found");
    }

    // Try to authenticate user (they might be logged in or not)
    let auth;
    try {
      auth = await requireAuth();
    } catch (error) {
      // User is not authenticated - return 401 with invitation data
      return new Response(
        JSON.stringify({ 
          error: "Authentication required",
          requiresAuth: true,
          invitation: {
            id: invitation.id,
            token: invitation.token,
            email: invitation.email,
            workspaceId: invitation.workspaceId,
            workspaceName: workspace.name,
            workspaceSlug: workspace.slug,
            role: invitation.role,
            inviterName: invitation.invitedBy
          }
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (auth instanceof Response) return auth;

    // User is authenticated - check if emails match
    if (auth.email !== invitation.email) {
      return err(
        `This invitation was sent to ${invitation.email}, but you're logged in as ${auth.email}`,
        403,
        "EMAIL_MISMATCH"
      );
    }

    // Check if user is already a member
    const existingMember = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: invitation.workspaceId,
          userId: auth.userId
        }
      }
    });

    if (existingMember) {
      return err(
        "You are already a member of this workspace",
        409,
        "ALREADY_MEMBER"
      );
    }

    // Add user to workspace in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create workspace member
      const member = await tx.workspaceMember.create({
        data: {
          id: dropid("wsm"),
          workspaceId: invitation.workspaceId,
          userId: auth.userId,
          role: invitation.role as any,
          joinedAt: new Date(),
          invitedBy: invitation.invitedBy
        }
      });

      // Update invitation status
      await tx.teamInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date()
        }
      });

      return member;
    });

    return ok({
      success: true,
      workspaceId: invitation.workspaceId,
      workspaceSlug: workspace.slug,
      workspaceName: workspace.name,
      role: result.role
    }, "Successfully joined workspace");

  } catch (error) {
    console.error("[ACCEPT_INVITATION]", error);
    return serverError();
  }
}