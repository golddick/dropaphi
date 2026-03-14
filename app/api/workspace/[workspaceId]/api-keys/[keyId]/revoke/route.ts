// app/api/workspace/[workspaceId]/api-keys/[keyId]/revoke/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { ApiKeyStatus } from "@/lib/generated/prisma/enums";
import { ok, err, serverError } from "@/lib/respond/response";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ workspaceId: string, keyId: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const { workspaceId, keyId } = await context.params;

    // Verify admin access
    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!member) {
      return err("Admin access required", 403);
    }

    // Check if key exists and belongs to workspace
    const existingKey = await db.apiKey.findFirst({
      where: {
        id: keyId,
        workspaceId,
      },
    });

    if (!existingKey) {
      return err("API Key not found", 404);
    }

    await db.apiKey.update({
      where: { id: keyId },
      data: { status: ApiKeyStatus.REVOKED },
    });

    return ok(null, "API Key revoked successfully");
  } catch (error) {
    console.error("[REVOKE_API_KEY]", error);
    return serverError();
  }
}