// // app/api/workspace/[workspaceId]/email/[emailId]/status/route.ts
// import { NextRequest } from "next/server";
// import { db } from "@/lib/db";
// import { requireAuth } from "@/lib/auth/auth-server";
// import { ok, unauthorized, notFound, serverError, validationError } from "@/lib/respond/response";
// import { z } from "zod";

// const statusUpdateSchema = z.object({
//   status: z.enum(['PENDING', 'SENT' , 'DELIVERED' , 'BOUNCED' , 'FAILED']),
//   metadata: z.record(z.any()).optional(),
// });

// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: Promise<{ workspaceId: string; emailId: string }> }
// ) {
//   try {
//     const { workspaceId, emailId } = await params; 
    
//     // Authenticate user
//     const auth = await requireAuth();
//     if (auth instanceof Response) return auth;

//     // Check workspace membership
//     const member = await db.workspaceMember.findFirst({
//       where: {
//         workspaceId,
//         userId: auth.userId,
//       },
//     });

//     if (!member) {
//       return unauthorized();
//     }

//     // Parse and validate request body
//     const body = await req.json();
//     const parsed = statusUpdateSchema.safeParse(body);

//     if (!parsed.success) {
//       return validationError(parsed.error);
//     }

//     const { status, metadata } = parsed.data;

//     // Build update data with timestamps
//     const updateData: any = {
//       status,
//       metadata: metadata ? { ...metadata } : undefined,
//       updatedAt: new Date(),
//     };

//     // Set appropriate timestamp based on status
//     switch (status) {
//       case 'DELIVERED':
//         updateData.deliveredAt = new Date();
//         break;
//       case 'BOUNCED':
//         updateData.bouncedAt = new Date();
//         break;

//     }

//     // Update email
//     const email = await db.email.update({
//       where: {
//         id: emailId,
//         workspaceId,
//       },
//       data: updateData,
//     });

//     return ok(email, `Email status updated to ${status}`);

//   } catch (error) {
//     console.error("[EMAIL_STATUS_UPDATE_ERROR]", error);
//     return serverError();
//   }
// }