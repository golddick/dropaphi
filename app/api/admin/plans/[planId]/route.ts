import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError, notFound } from "@/lib/respond/response";
import { requireAdmin } from "@/lib/auth/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const { planId } = await params;
    const body = await req.json();

    const plan = await db.plan.update({
      where: { id: planId },
      data: body
    });

    return ok(plan);
  } catch (error) {
    console.error('[ADMIN_PLAN_PATCH]', error);
    return serverError('Failed to update plan');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const { planId } = await params;

    // Archive plan instead of deleting
    await db.plan.update({
      where: { id: planId },
      data: { isArchived: true, isActive: false }
    });

    return ok({ message: "Plan archived successfully" });
  } catch (error) {
    console.error('[ADMIN_PLAN_DELETE]', error);
    return serverError('Failed to archive plan');
  }
}
