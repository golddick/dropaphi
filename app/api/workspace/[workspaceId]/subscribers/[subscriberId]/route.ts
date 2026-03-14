// app/api/workspace/[workspaceId]/subscribers/[subscriberId]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { z } from "zod";
import { 
  ok, 
  unauthorized, 
  forbidden, 
  notFound, 
  validationError, 
  serverError,
  noContent
} from "@/lib/respond/response";

const updateSubscriberSchema = z.object({
  name: z.string().optional().nullable(),
  segments: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
  status: z.enum(['ACTIVE', 'UNSUBSCRIBED', 'BOUNCED']).optional(),
});

// ========================================
// GET /api/workspace/[workspaceId]/subscribers/[subscriberId]
// Get single subscriber by ID
// ========================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; id: string }> }
) {
  try {
    const { workspaceId, id } = await params;

    console.log(id, workspaceId, 'api sub id')
    
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    });

    if (!member) {
      return unauthorized();
    }

    const subscriber = await db.subscriber.findFirst({
      where: {
        id: id,
        workspaceId,
      },
    });

    if (!subscriber) {
      return notFound("Subscriber not found");
    }

    return ok({ subscriber });

  } catch (error) {
    console.error("[SUBSCRIBER_GET_ERROR]", error);
    return serverError();
  }
}

// ========================================
// PATCH /api/workspace/[workspaceId]/subscribers/[subscriberId]
// Update subscriber
// ========================================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; subscriberId: string }> }
) {
  try {
    const { workspaceId, subscriberId } = await params;
    
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    });

    if (!member || !['OWNER', 'ADMIN', 'WRITER'].includes(member.role)) {
      return forbidden("Insufficient permissions");
    }

    const body = await req.json();
    const parsed = updateSubscriberSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { name, segments, customFields, status } = parsed.data;

    // Check if subscriber exists
    const existing = await db.subscriber.findFirst({
      where: {
        id: subscriberId,
        workspaceId,
      },
    });

    if (!existing) {
      return notFound("Subscriber not found");
    }

    // Build update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (segments !== undefined) updateData.segments = segments;
    if (customFields !== undefined) updateData.customFields = customFields;
    
    if (status !== undefined) {
      updateData.status = status;
      
      // Set timestamps based on status
      if (status === 'ACTIVE' && existing.status !== 'ACTIVE') {
        updateData.confirmedAt = new Date();
        updateData.unsubscribedAt = null;
      } else if (status === 'UNSUBSCRIBED' && existing.status !== 'UNSUBSCRIBED') {
        updateData.unsubscribedAt = new Date();
      } else if (status === 'BOUNCED' && existing.status !== 'BOUNCED') {
        // Bounced status doesn't have a specific timestamp in the schema
        // You might want to add bouncedAt to your model
      }
    }

    const subscriber = await db.subscriber.update({
      where: {
        id: subscriberId,
        workspaceId,
      },
      data: updateData,
    });

    return ok({ subscriber }, "Subscriber updated successfully");

  } catch (error) {
    console.error("[SUBSCRIBER_UPDATE_ERROR]", error);
    return serverError();
  }
}

// ========================================
// DELETE /api/workspace/[workspaceId]/subscribers/[subscriberId]
// Delete single subscriber
// ========================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; subscriberId: string }> }
) {
  try {
    const { workspaceId, subscriberId } = await params;
    
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    });

    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      return forbidden("Only owners and admins can delete subscribers");
    }

    const result = await db.subscriber.deleteMany({
      where: {
        id: subscriberId,
        workspaceId,
      },
    });

    if (result.count === 0) {
      return notFound("Subscriber not found");
    }

    return noContent();

  } catch (error) {
    console.error("[SUBSCRIBER_DELETE_ERROR]", error);
    return serverError();
  }
}