// app/api/workspace/[workspaceId]/api-keys/[keyId]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { z } from "zod";
import { ApiKeyStatus } from "@/lib/generated/prisma/enums";
import { ok, err, serverError, validationError } from "@/lib/respond/response";

const updateKeySchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['ACTIVE', 'REVOKED']).optional(),
  permissions: z.record(z.any()).optional(),
  rateLimitPerMin: z.number().min(1).max(10000).optional(),
  expiresAt: z.string().nullable().optional(),
});

// PATCH /api/workspace/[workspaceId]/api-keys/[keyId]
export async function PATCH(
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

    const body = await req.json();
    const parsed = updateKeySchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
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

    // Prepare update data
    const updateData: any = {};
    if (parsed.data.name) updateData.name = parsed.data.name;
    if (parsed.data.status) updateData.status = parsed.data.status;
    if (parsed.data.permissions) updateData.permissions = parsed.data.permissions;
    if (parsed.data.rateLimitPerMin) updateData.rateLimitPerMin = parsed.data.rateLimitPerMin;
    if (parsed.data.expiresAt !== undefined) {
      updateData.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
    }

    const updatedKey = await db.apiKey.update({
      where: { id: keyId },
      data: updateData,
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastFourChars: true,
        status: true,
        permissions: true,
        rateLimitPerMin: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return ok({ apiKey: updatedKey }, "API Key updated successfully");
  } catch (error) {
    console.error("[UPDATE_API_KEY]", error);
    return serverError();
  }
}

// DELETE /api/workspace/[workspaceId]/api-keys/[keyId]
export async function DELETE(
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

    await db.apiKey.delete({
      where: { id: keyId },
    });

    return ok(null, "API Key deleted successfully");
  } catch (error) {
    console.error("[DELETE_API_KEY]", error);
    return serverError();
  }
}