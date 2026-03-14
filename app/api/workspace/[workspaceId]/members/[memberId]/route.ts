// app/api/workspace/[workspaceId]/members/[memberId]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/auth-server";
import { db } from "@/lib/db";
import { err, ok, serverError, validationError } from "@/lib/respond/response";
import { WorkspaceRole } from "@/lib/stores/types";

const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'WRITER', 'DEVELOPER', 'VIEWER']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  try {
    const { workspaceId, memberId } = await params;
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    // Check if current user is owner or admin
    const currentMember = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: auth.userId,
        },
      },
    });

    if (!currentMember) {
      return err("You don't have access to this workspace", 403);
    }

    // Only owners and admins can update roles
    if (currentMember.role !== 'OWNER' && currentMember.role !== 'ADMIN') {
      return err("Only owners and admins can update member roles", 403);
    }

    // Check if target member exists
    const targetMember = await db.workspaceMember.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      return err("Member not found", 404);
    }

    // Owners cannot be modified by admins
    if (targetMember.role === 'OWNER' && currentMember.role !== 'OWNER') {
      return err("Only owners can modify other owners", 403);
    }

    const body = await req.json();
    const parsed = updateRoleSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    // Update role
    const updated = await db.workspaceMember.update({
      where: { id: memberId },
      data: { role: parsed.data.role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return ok({ member: updated }, "Role updated successfully");
  } catch (error) {
    console.error("[UPDATE_MEMBER_ROLE]", error);
    return serverError();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  try {
    const { workspaceId, memberId } = await params;
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    // Check if current user is owner or admin
    const currentMember = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: auth.userId,
        },
      },
    });

    if (!currentMember) {
      return err("You don't have access to this workspace", 403);
    }

    // Only owners and admins can remove members
    if (currentMember.role !== 'OWNER' && currentMember.role !== 'ADMIN') {
      return err("Only owners and admins can remove members", 403);
    }

    // Check if target member exists
    const targetMember = await db.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      return err("Member not found", 404);
    }

    // Cannot remove the last owner
    if (targetMember.role === 'OWNER') {
      const ownerCount = await db.workspaceMember.count({
        where: { workspaceId, role: 'OWNER' },
      });

      if (ownerCount <= 1) {
        return err("Cannot remove the last owner", 400);
      }
    }

    // Remove member
    await db.workspaceMember.delete({
      where: { id: memberId },
    });

    return ok(null, "Member removed successfully");
  } catch (error) {
    console.error("[REMOVE_MEMBER]", error);
    return serverError();
  }
}