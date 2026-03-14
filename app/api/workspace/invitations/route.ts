

// app/api/workspace/invitations/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError, unauthorized, forbidden, conflict } from "@/lib/respond/response";
import { requireAuth } from "@/lib/auth/auth-server";
import { dropid } from "dropid";
import { sendInvitationEmails } from "@/lib/email/invitation/invitation";
import z from "zod";

const sendInvitationsSchema = z.object({
  workspaceId: z.string(),
  invitations: z.array(z.object({
    email: z.string().email(),
    role: z.enum(['ADMIN', 'WRITER', 'DEVELOPER', 'VIEWER']),
  })),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const { workspaceId, invitations } = body;

    if (!workspaceId || !invitations || !Array.isArray(invitations)) {
      return forbidden("Workspace ID and invitations array are required");
    }

    // Verify user has access to workspace and get workspace details
    const member = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: auth.userId
        }
      },
      include: {
        workspace: true 
      }
    });

    if (!member) {
      return unauthorized("You don't have access to this workspace");
    }

    // Check if user has permission to invite (OWNER or ADMIN)
    if (member.role !== 'OWNER' && member.role !== 'ADMIN') {
      return unauthorized("Only owners and admins can invite members");
    }

    // Get inviter details
    const inviter = await db.user.findUnique({
      where: { id: auth.userId },
      select: { fullName: true, email: true }
    });

    if (!inviter) {
      return unauthorized("Inviter not found");
    }

    // Filter out empty emails and duplicates
    const validInvitations = invitations
      .filter(inv => inv.email?.trim())
      .filter((inv, index, self) => 
        index === self.findIndex(i => i.email.toLowerCase() === inv.email.toLowerCase())
      );

    if (validInvitations.length === 0) {
      return forbidden("No valid email addresses provided");
    }

    // Check for existing pending invitations
    const existingInvitations = await db.teamInvitation.findMany({
      where: {
        workspaceId,
        email: { in: validInvitations.map(inv => inv.email.toLowerCase()) },
        status: 'PENDING'
      }
    });

    if (existingInvitations.length > 0) {
      const existingEmails = existingInvitations.map(inv => inv.email);
      return conflict(
        "Some emails already have pending invitations",
        "EXISTING_INVITATIONS",
      );
    }

    // Check if users are already members
    const users = await db.user.findMany({
      where: {
        email: { in: validInvitations.map(inv => inv.email.toLowerCase()) }
      },
      select: { id: true, email: true }
    });

    if (users.length > 0) {
      const existingMembers = await db.workspaceMember.findMany({
        where: {
          workspaceId,
          userId: { in: users.map(u => u.id) }
        }
      });

      if (existingMembers.length > 0) {
        const memberEmails = users
          .filter(u => existingMembers.some(m => m.userId === u.id))
          .map(u => u.email);
        
        return conflict(
          "Some emails are already members of this workspace",
          "EXISTING_MEMBERS"
        );
      }
    }

    // Create invitations in database
    const createdInvitations = await db.$transaction(
      validInvitations.map(inv => 
        db.teamInvitation.create({
          data: {
            id: dropid("inv"),
            workspaceId,
            token: dropid("tkn"), 
            email: inv.email.toLowerCase(),
            role: inv.role,
            invitedBy: auth.userId,
            status: 'PENDING',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          }
        })
      )
    );

    // Get workspace name for emails
    const workspaceName = member.workspace.name;

    // Prepare invitations with additional data for emails
    const invitationsWithDetails = createdInvitations.map(inv => ({
      id: inv.id,
      workspaceId: inv.workspaceId,
      email: inv.email,
      role: inv.role,
      token: inv.token,
      invitedBy: inv.invitedBy,
      workspaceName,
      inviterName: inviter.fullName || inviter.email,
      inviterEmail: inviter.email
    }));

    // Send invitation emails in the background
    if (invitationsWithDetails.length > 0) {
      // Don't await - let it run in background
      sendInvitationEmails(invitationsWithDetails).catch(error => {
        console.error('[Invitations] Background email sending failed:', error);
      });
    }
 
    return ok({ 
      invitations: createdInvitations.map(inv => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        status: inv.status,
        expiresAt: inv.expiresAt
      })),
      count: createdInvitations.length 
    }, "Invitations sent successfully");
  } catch (error) {
    console.error("[CREATE_INVITATIONS]", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return unauthorized("Unauthorized");
    }
    
    return serverError();
  }
}

// GET endpoint to fetch invitations for a workspace
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return forbidden("Workspace ID is required");
    }

    // Verify user has access to workspace
    const member = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: auth.userId
        }
      }
    });

    if (!member) {
      return unauthorized("You don't have access to this workspace");
    }

    const invitations = await db.teamInvitation.findMany({
      where: {
        workspaceId,
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get inviter details for each invitation
    const invitationsWithDetails = await Promise.all(
      invitations.map(async (inv) => {
        const inviter = await db.user.findUnique({
          where: { id: inv.invitedBy },
          select: { fullName: true, email: true }
        });
        
        return {
          ...inv,
          inviterName: inviter?.fullName || inviter?.email,
          inviterEmail: inviter?.email
        };
      })
    );

    return ok({ invitations: invitationsWithDetails });
  } catch (error) {
    console.error("[GET_INVITATIONS]", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return unauthorized("Unauthorized");
    }
    
    return serverError();
  }
}



