// import { NextRequest } from "next/server";
// import { db } from "@/lib/db";
// import { ok, serverError, notFound, err } from "@/lib/respond/response";
// import { requireAdmin } from "@/lib/auth/admin-auth";

// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: { userId: string } }
// ) {
//   try {
//     const auth = await requireAdmin();
//     if (auth instanceof Response) return auth;

//     const { userId } = params;
//     const { status } = await req.json();

//     if (!status) {
//       return err("Status is required");
//     }

//     const user = await db.user.update({
//       where: { id: userId },
//       data: { status },
//     });

//     return ok({ user });
//   } catch (error) {
//     console.error('Error updating user status:', error);
//     return serverError('Failed to update user status');
//   }
// }






import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError, notFound, err } from "@/lib/respond/response";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { NotificationService } from "@/lib/notification.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
        const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const { userId } = params;
    const { status } = await req.json();

    if (!status) {
      return err("Status is required");
    }

    // Get current user data before update
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { 
        status: true, 
        fullName: true,
        email: true 
      }
    });

    if (!currentUser) {
      return notFound("User not found");
    }

    // Update user status
    const user = await db.user.update({
      where: { id: userId },
      data: { status },
    });

    // Send notification about status change
    await NotificationService.create({
      userId,
      type: 'SYSTEM_ALERT',
      variables: {
        name: currentUser.fullName,
        oldStatus: currentUser.status.toLowerCase(),
        newStatus: status.toLowerCase(),
        statusChange: true,
      },
      metadata: {
        action: 'status_change',
        oldStatus: currentUser.status,
        newStatus: status,
      },
      priority: 'MEDIUM',
      actionUrl: `/admin/users/${userId}`,
      actionLabel: 'View Details',
    });

    return ok({ 
      message: "User status updated successfully",
      user: {
        id: user.id,
        status: user.status
      }
    });
  } catch (error) {
    console.error('[ADMIN_UPDATE_USER_STATUS]', error);
    return serverError("Failed to update user status");
  }
}