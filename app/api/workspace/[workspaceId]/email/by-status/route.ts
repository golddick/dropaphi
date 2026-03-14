// app/api/workspace/[workspaceId]/email/by-status/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { ok, unauthorized, serverError, validationError } from "@/lib/respond/response";
import { z } from "zod";

const statusQuerySchema = z.object({
  status: z.enum(['PENDING', 'SENT' , 'DELIVERED' , 'OPENED' , 'CLICKED' , 'BOUNCED' , 'FAILED']),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    
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

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const parsed = statusQuerySchema.safeParse({
      status: searchParams.get('status'),
      limit: searchParams.get('limit'),
    });

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { status, limit } = parsed.data;

    // Get emails by status
    const emails = await db.email.findMany({
      where: {
        workspaceId,
        status,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return ok({ emails });

  } catch (error) {
    console.error("[EMAIL_BY_STATUS_ERROR]", error);
    return serverError();
  }
}