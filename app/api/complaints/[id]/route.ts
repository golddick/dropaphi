// app/api/complaints/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { dropid } from "dropid";
import { ok, serverError, notFound, err } from "@/lib/respond/response";
import { requireAdmin } from "@/lib/auth/admin-auth";

// GET - Fetch single complaint
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;
    
    const { id } = await params;

    const complaint = await db.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return notFound("Complaint not found");
    }

    // Check authorization
    if (!auth || complaint.userId !== auth.user?.id) {
      return err("Unauthorized", 403, "UNAUTHORIZED");
    }

    return ok({
      complaint: {
        ...complaint,
        replies: typeof complaint.replies === 'string' ? JSON.parse(complaint.replies) : complaint.replies,
      },
    });
  } catch (error) {
    console.error("[COMPLAINT_GET]", error);
    return serverError();
  }
}

// PATCH - Update complaint (status, add reply)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;
    

    const { id } = await params;
    const body = await req.json();
    const { status, reply } = body;


    // Check if complaint exists
    const existing = await db.complaint.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFound("Complaint not found");
    }

    // Only admins can update status or reply
    if (!auth) {
      return err("Unauthorized", 403, "UNAUTHORIZED");
    }


    const updates: any = {};

    if (status) {
      updates.status = status;
    }

    if (reply) {
      const currentReplies = typeof existing.replies === 'string' 
        ? JSON.parse(existing.replies) 
        : existing.replies;
      
      const newReply = {
        id: dropid("rep"),
        author: "admin",
        authorName: auth.user.email || "Support Team",
        message: reply,
        createdAt: new Date().toISOString(),
      };
      
      updates.replies = JSON.stringify([...currentReplies, newReply]);
      
      // Auto-update status to IN_PROGRESS when replying to OPEN complaint
      if (existing.status === "OPEN") {
        updates.status = "IN_PROGRESS";
      }
    }

    const updated = await db.complaint.update({
      where: { id },
      data: updates,
    });

    return ok({
      complaint: {
        ...updated,
        replies: typeof updated.replies === 'string' ? JSON.parse(updated.replies) : updated.replies,
      },
    });
  } catch (error) {
    console.error("[COMPLAINT_PATCH]", error);
    return serverError();
  }
}

// DELETE - Delete complaint (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;
    
    const { id } = await params;
   
    if (!auth) {
      return err("Unauthorized", 403, "UNAUTHORIZED");
    }

    await db.complaint.delete({
      where: { id },
    });

    return ok({ message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("[COMPLAINT_DELETE]", error);
    return serverError();
  }
}