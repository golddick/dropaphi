// app/api/workspace/[workspaceId]/email/[emailId]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { ok, unauthorized, notFound, serverError, forbidden, noContent } from "@/lib/respond/response";

// ========================================
// GET /api/workspace/[workspaceId]/email/[emailId]
// Get single email by ID
// ========================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; emailId: string }> }
) {
  try {
    const { workspaceId, emailId } = await params;
    
    // Authenticate user
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    // Check workspace membership
    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    });

    if (!member) {
      return unauthorized();
    }

    // Get email with related data
    const email = await db.email.findFirst({
      where: {
        id: emailId,
        workspaceId,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            subject: true,
            bodyHtml: true,
          }
        },
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        },
        trackingEvents: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
        _count: {
          select: {
            trackingEvents: true,
          }
        }
      }
    });

    if (!email) {
      return notFound("Email not found");
    }

    return ok(email);

  } catch (error) {
    console.error("[EMAIL_GET_BY_ID_ERROR]", error);
    return serverError();
  }
}

// ========================================
// DELETE /api/workspace/[workspaceId]/email/[emailId]
// Delete single email
// ========================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; emailId: string }> }
) {
  try {
    const { workspaceId, emailId } = await params;
    
    // Authenticate user
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    // Check workspace membership and permissions
    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    });

    if (!member) {
      return unauthorized();
    }

    if (!['OWNER', 'ADMIN'].includes(member.role)) {
      return forbidden("Only owners and admins can delete emails");
    }

    // Delete email
    const result = await db.email.deleteMany({
      where: {
        id: emailId,
        workspaceId,
      },
    });

    if (result.count === 0) {
      return notFound("Email not found");
    }

    return noContent();

  } catch (error) {
    console.error("[EMAIL_DELETE_ERROR]", error);
    return serverError();
  }
}