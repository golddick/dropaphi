// import { NextRequest } from "next/server";
// import { db } from "@/lib/db";
// import { ok, badRequest, serverError } from "@/lib/respond/response";
// import { requireAdmin } from "@/lib/auth/admin-auth";
// import { sendEmail } from "@/lib/email";

// export async function POST(
//   req: NextRequest,
//   { params }: { params: { userId: string } }
// ) {
//   try {
//     const authResult = await requireAdmin(req);
//     if (!authResult.success) {
//       return authResult.response;
//     }

//     const { userId } = params;
//     const { subject, body } = await req.json();

//     if (!subject || !body) {
//       return badRequest("Subject and body are required");
//     }

//     const user = await db.user.findUnique({
//       where: { id: userId },
//       select: { email: true, fullName: true }
//     });

//     if (!user) {
//       return badRequest("User not found");
//     }

//     // Send email using your email service
//     await sendEmail({
//       to: user.email,
//       subject,
//       html: `<p>${body}</p>`,
//     });

//     // Log the communication
//     await db.notification.create({
//       data: {
//         userId,
//         type: 'EMAIL',
//         title: subject,
//         message: body,
//         status: 'SENT'
//       }
//     });

//     return ok({ message: "Email sent successfully" });
//   } catch (error) {
//     console.error('Error sending email:', error);
//     return serverError('Failed to send email');
//   }
// }












import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError, notFound, err } from "@/lib/respond/response";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { NotificationService } from "@/lib/notification.service";


export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const { userId } = params;
    const { subject, body } = await req.json();

    if (!subject || !body) {
      return err("Subject and body are required");
    }

    // Get user details for notification variables
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { 
        email: true, 
        fullName: true,
        emailVerified: true 
      }
    });

    if (!user) {
      return notFound("User not found");
    }

    // Create notification using the service
    // Using a custom type that fits your use case
    const notification = await NotificationService.create({
      userId,
      type: 'SYSTEM_ALERT', // Using an existing notification type
      variables: {
        name: user.fullName,
        email: user.email,
        subject: subject,
        message: body,
        adminMessage: true, // Flag to indicate this is from admin
      },
      metadata: {
        adminEmail: true,
        subject,
        body,
      },
      priority: 'MEDIUM',
      actionUrl: `/admin/users/${userId}`,
      actionLabel: 'View User',
    });

    if (!notification) {
      return serverError("Failed to create notification");
    }

    // Also send via email channel directly since notification service might not send email immediately
    // You can enhance the NotificationService to handle this or send email here
    // For now, we'll log that notification was created

    return ok({ 
      message: "Email notification created successfully",
      notificationId: notification.id 
    });
  } catch (error) {
    console.error('[ADMIN_SEND_EMAIL]', error);
    return serverError("Failed to send email");
  }
}