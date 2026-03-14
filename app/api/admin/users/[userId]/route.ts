import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError, notFound } from "@/lib/respond/response";
import { requireAdmin } from "@/lib/auth/admin-auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const { userId } = params;

    // Delete user (cascading delete will handle related records)
    await db.user.delete({
      where: { id: userId },
    });

    return ok({ message: "User deleted successfully" });
  } catch (error) {
    console.error('Error deleting user:', error);
    return serverError('Failed to delete user');
  }
}