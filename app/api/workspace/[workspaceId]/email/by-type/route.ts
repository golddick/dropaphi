// app/api/workspace/[workspaceId]/email/by-type/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { ok, unauthorized, serverError, validationError } from "@/lib/respond/response";
import { z } from "zod";

const typeQuerySchema = z.object({
  type: z.enum(['IN_APP', 'API']),
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
    const parsed = typeQuerySchema.safeParse({
      type: searchParams.get('type'),
      limit: searchParams.get('limit'),
    });

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { type, limit } = parsed.data;

    // Get emails by type
    const emails = await db.email.findMany({
      where: {
        workspaceId,
        mailSentFrom: type,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return ok({ emails });

  } catch (error) {
    console.error("[EMAIL_BY_TYPE_ERROR]", error);
    return serverError();
  }
}