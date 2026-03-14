// app/api/workspace/[workspaceId]/email/recent/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { ok, unauthorized, serverError, err } from "@/lib/respond/response";
import { z } from "zod";

const recentQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
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
    const parsed = recentQuerySchema.safeParse({
      limit: searchParams.get('limit'),
    });

    if (!parsed.success) {
      return err("Invalid limit parameter", 400, "VALIDATION_ERROR", parsed.error.errors);
    }

    const { limit } = parsed.data;

    // Get recent emails
    const emails = await db.email.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        template: {
          select: {
            id: true,
            name: true,
          }
        },
        campaign: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return ok({ emails });

  } catch (error) {
    console.error("[RECENT_EMAILS_ERROR]", error);
    return serverError();
  }
}