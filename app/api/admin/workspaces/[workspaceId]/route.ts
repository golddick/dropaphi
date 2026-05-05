import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError, notFound, err } from "@/lib/respond/response";
import { requireAdmin } from "@/lib/auth/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const { workspaceId } = await params;
    const body = await req.json();
    const { isActive, plan } = body;

    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) {
      return notFound("Workspace not found");
    }

    const updated = await db.workspace.update({
      where: { id: workspaceId },
      data: {
        isActive: isActive !== undefined ? isActive : workspace.isActive,
        plan: plan !== undefined ? plan : workspace.plan,
      }
    });

    return ok({ workspace: updated }, "Workspace updated successfully");
  } catch (error) {
    console.error("[ADMIN_UPDATE_WORKSPACE]", error);
    return serverError();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const { workspaceId } = await params;

    // We should probably be careful with deleting workspaces
    // Maybe just deactivate it?
    // But if the user really wants to delete:
    
    await db.workspace.delete({
      where: { id: workspaceId }
    });

    return ok(null, "Workspace deleted successfully");
  } catch (error) {
    console.error("[ADMIN_DELETE_WORKSPACE]", error);
    return serverError();
  }
}
