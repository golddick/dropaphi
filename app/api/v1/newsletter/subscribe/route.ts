// app/api/v1/newsletter/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { validateApiKey } from "@/lib/api-key/validate";
import { handleCORS, addCORSHeaders } from "@/lib/cors";
import { dropid } from "dropid";
import { welcomeEmail } from "@/lib/email/service/newsletter-welcome-email.service";
import { checkWorkspaceSubscriberLimit, deductWorkspaceSubscriber } from "@/lib/v1-api/workspace/sender";
import { checkServiceStatus } from "@/lib/services/service-status";
import { Services } from "@/lib/generated/prisma";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  source: z.string().default("api_v1"),
  templateId: z.string().optional(),
});

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return handleCORS(req);
}

/**
 * Send welcome email to new subscriber
 */
async function sendWelcomeEmail({
  workspaceId,
  subscriber,
  templateId
}: {
  workspaceId: string;
  subscriber: {
    id: string;
    email: string;
    name?: string | null;
  };
  templateId?: string;
}) {
  try {
    const result = await welcomeEmail.sendWelcomeEmail({
      workspaceId,
      subscriber,
      templateId,
      customVariables: {
        source: 'api_v1',
        subscription_date: new Date().toISOString(),
      }
    });

    if (!result.success) {
      console.error('[V1_SUBSCRIBE] Welcome email failed:', result.error);
    }
    return result;
  } catch (error) {
    console.error('[V1_SUBSCRIBE] Error sending welcome email:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function POST(req: NextRequest) {
  let subscriberUnits = 1; // Each subscriber = 1 unit
  let subscriberId: string | null = null;
  
  try {

    // 0. Check if subscriber service is active
      const serviceStatusError = await checkServiceStatus(Services.SUBSCRIBERS);
      if (serviceStatusError) {
        return addCORSHeaders(serviceStatusError);
      }

    // 1. Validate API key
    const validation = await validateApiKey(req);
    if (!validation.valid) {
      const response = NextResponse.json(
        { success: false, error: validation.error },
        { status: validation.status || 401 }
      );
      return addCORSHeaders(response);
    }

    const { keyInfo } = validation;
    if (!keyInfo) {
      return addCORSHeaders(NextResponse.json(
        { success: false, error: "Invalid API key information" },
        { status: 401 }
      ));
    }

    const workspaceId = keyInfo.workspaceId;

    // 2. Parse and validate request body
    const body = await req.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: parsed.error.errors,
        },
        { status: 400 }
      );
      return addCORSHeaders(response);
    }

    const { email, name, source, templateId } = parsed.data;

    // 3. CHECK subscriber limit (but DON'T deduct yet)
    const limitCheck = await checkWorkspaceSubscriberLimit(workspaceId, subscriberUnits);
    
    if (!limitCheck.allowed) {
      return addCORSHeaders(NextResponse.json(
        { 
          success: false, 
          error: "Subscriber limit exceeded",
          details: {
            limit: limitCheck.limit,
            current: limitCheck.current,
            remaining: limitCheck.remaining,
            requested: subscriberUnits,
          }
        },
        { status: 429 }
      ));
    }

    // 4. Check if subscriber already exists
    const existingSubscriber = await db.subscriber.findUnique({
      where: {
        workspaceId_email: {
          workspaceId,
          email,
        },
      },
    });

    if (existingSubscriber) {
      if (existingSubscriber.status === 'ACTIVE') {
        return addCORSHeaders(NextResponse.json(
          { success: false, error: "Email already subscribed", code: "ALREADY_SUBSCRIBED" },
          { status: 409 }
        ));
      }

      if (existingSubscriber.status === 'UNSUBSCRIBED') {
        // Reactivate subscriber
        const updated = await db.subscriber.update({
          where: { id: existingSubscriber.id },
          data: {
            status: 'ACTIVE',
            unsubscribedAt: null,
            confirmedAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // DEDUCT credits for reactivation after successful update
        const deductionResult = await deductWorkspaceSubscriber(workspaceId, subscriberUnits);
        
        if (!deductionResult.success) {
          console.error("[CRITICAL] Subscriber reactivated but deduction failed:", {
            subscriberId: updated.id,
            workspaceId,
            email,
            error: deductionResult.error
          });
        }

        // Send welcome email in background
        sendWelcomeEmail({ workspaceId, subscriber: updated, templateId }).catch(e => console.error(e));

        return addCORSHeaders(NextResponse.json({
          success: true,
          message: "Subscription reactivated",
          subscriber: updated,
          billing: deductionResult.success ? {
            method: deductionResult.method,
            unitsUsed: subscriberUnits,
            cost: deductionResult.cost,
            message: deductionResult.message,
          } : {
            deducted: false,
            warning: "Subscription reactivated but billing failed."
          }
        }));
      }
    }

    // 5. Create new subscriber
    const subscriber = await db.subscriber.create({
      data: {
        id: dropid('sub'),
        workspaceId,
        email,
        name: name || null,
        status: 'ACTIVE',
        source,
        segments: ['newsletter'],
        confirmedAt: new Date(),
        customFields: {
          subscribedAt: new Date().toISOString(),
          source,
        },
      },
    });
    
    subscriberId = subscriber.id;

    // 6. SUBSCRIBER CREATED SUCCESSFULLY - NOW DEDUCT CREDITS
    const deductionResult = await deductWorkspaceSubscriber(workspaceId, subscriberUnits);
    
    if (!deductionResult.success) {
      // Critical error - subscriber created but deduction failed
      console.error("[CRITICAL] Subscriber created but deduction failed:", {
        subscriberId: subscriber.id,
        workspaceId,
        email,
        units: subscriberUnits,
        error: deductionResult.error
      });
      
      // Update subscriber with billing error
      await db.subscriber.update({
        where: { id: subscriber.id },
        data: {
          customFields: {
            ...(subscriber.customFields as Record<string, any>),
            billingError: deductionResult.error,
            billingStatus: "FAILED",
          },
        },
      });
    } else {
      // Update subscriber with billing info
      await db.subscriber.update({
        where: { id: subscriber.id },
        data: {
          customFields: {
            ...(subscriber.customFields as Record<string, any>),
            billingMethod: deductionResult.method,
            billingCost: deductionResult.cost,
            billingStatus: "SUCCESS",
          },
        },
      });
    }

    // 7. Create a usage log for analytics (only if deduction succeeded or at least attempted)
    await db.usageLog.create({
      data: {
        id: dropid('ulg'),
        workspaceId,
        service: 'SUBSCRIBER',
        month: new Date().toISOString().slice(0, 7),
        currentSubscribers: limitCheck.current + 1,
        createdAt: new Date(),
        metadata: {
          billingSuccess: deductionResult.success,
          billingMethod: deductionResult.success ? deductionResult.method : null,
        }
      }
    });

    // 8. Send welcome email in background
    sendWelcomeEmail({ workspaceId, subscriber, templateId }).catch(e => console.error(e));

    const response = NextResponse.json(
      { 
        success: true, 
        message: "Subscription successful",
        subscriber,
        billing: deductionResult.success ? {
          method: deductionResult.method,
          unitsUsed: subscriberUnits,
          cost: deductionResult.cost,
          message: deductionResult.message,
          ...(deductionResult.method === "BALANCE" && {
            remainingBalance: deductionResult.remainingBalance
          }),
          ...(deductionResult.method === "SERVICE_CREDITS" && {
            remainingCredits: deductionResult.remainingCredits
          }),
        } : {
          deducted: false,
          warning: "Subscription successful but billing failed. Our team has been notified.",
        }
      },
      { status: 201 }
    );
    return addCORSHeaders(response);

  } catch (error) {
    console.error("[V1_SUBSCRIBE_ERROR]", error);
    
    // If subscriber was created but error occurred, mark it for review
    if (subscriberId) {
      await db.subscriber.update({
        where: { id: subscriberId },
        data: {
          status: 'BOUNCED',
          customFields: {
            error: (error as Error).message,
            timestamp: new Date().toISOString(),
          }
        }
      }).catch(console.error);
    }
    
    const response = NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        billing: {
          deducted: false,
          message: "No credits were deducted due to an error."
        }
      },
      { status: 500 }
    );
    return addCORSHeaders(response);
  }
}











// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { z } from "zod";
// import { validateApiKey } from "@/lib/api-key/validate";
// import { handleCORS, addCORSHeaders } from "@/lib/cors";
// import { dropid } from "dropid";
// import { welcomeEmail } from "@/lib/email/service/newsletter-welcome-email.service";

// const subscribeSchema = z.object({
//   email: z.string().email("Invalid email address"),
//   name: z.string().optional(),
//   source: z.string().default("api_v1"),
//   templateId: z.string().optional(),
// });

// // Handle OPTIONS requests for CORS preflight
// export async function OPTIONS(req: NextRequest) {
//   return handleCORS(req);
// }

// /**
//  * Send welcome email to new subscriber
//  */
// async function sendWelcomeEmail({
//   workspaceId,
//   subscriber,
//   templateId
// }: {
//   workspaceId: string;
//   subscriber: {
//     id: string;
//     email: string;
//     name?: string | null;
//   };
//   templateId?: string;
// }) {
//   try {
//     const result = await welcomeEmail.sendWelcomeEmail({
//       workspaceId,
//       subscriber,
//       templateId,
//       customVariables: {
//         source: 'api_v1',
//         subscription_date: new Date().toISOString(),
//       }
//     });

//     if (!result.success) {
//       console.error('[V1_SUBSCRIBE] Welcome email failed:', result.error);
//     }
//     return result;
//   } catch (error) {
//     console.error('[V1_SUBSCRIBE] Error sending welcome email:', error);
//     return { success: false, error: (error as Error).message };
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     // 1. Validate API key
//     const validation = await validateApiKey(req);
//     if (!validation.valid) {
//       const response = NextResponse.json(
//         { success: false, error: validation.error },
//         { status: validation.status || 401 }
//       );
//       return addCORSHeaders(response);
//     }

//     const { keyInfo } = validation;
//     if (!keyInfo) {
//       return addCORSHeaders(NextResponse.json(
//         { success: false, error: "Invalid API key information" },
//         { status: 401 }
//       ));
//     }

//     const workspaceId = keyInfo.workspaceId;

//     // 2. Parse and validate request body
//     const body = await req.json();
//     const parsed = subscribeSchema.safeParse(body);

//     if (!parsed.success) {
//       const response = NextResponse.json(
//         {
//           success: false,
//           error: "Validation error",
//           details: parsed.error.errors,
//         },
//         { status: 400 }
//       );
//       return addCORSHeaders(response);
//     }

//     const { email, name, source, templateId } = parsed.data;

//     // 3. Check workspace and limits
//     const workspace = await db.workspace.findUnique({
//       where: { id: workspaceId },
//       select: {
//         id: true,
//         name: true,
//         subscriberLimit: true,
//         currentSubscribers: true,
//       }
//     });

//     if (!workspace) {
//       return addCORSHeaders(NextResponse.json(
//         { success: false, error: "Workspace not found" },
//         { status: 404 }
//       ));
//     }

//     if (workspace.currentSubscribers >= workspace.subscriberLimit) {
//       return addCORSHeaders(NextResponse.json(
//         { success: false, error: "Workspace has reached its subscriber limit" },
//         { status: 403 }
//       ));
//     }

//     // 4. Check if subscriber already exists
//     const existingSubscriber = await db.subscriber.findUnique({
//       where: {
//         workspaceId_email: {
//           workspaceId,
//           email,
//         },
//       },
//     });

//     if (existingSubscriber) {
//       if (existingSubscriber.status === 'ACTIVE') {
//         return addCORSHeaders(NextResponse.json(
//           { success: false, error: "Email already subscribed", code: "ALREADY_SUBSCRIBED" },
//           { status: 409 }
//         ));
//       }

//       if (existingSubscriber.status === 'UNSUBSCRIBED') {
//         // Reactivate subscriber
//         const updated = await db.subscriber.update({
//           where: { id: existingSubscriber.id },
//           data: {
//             status: 'ACTIVE',
//             unsubscribedAt: null,
//             confirmedAt: new Date(),
//             updatedAt: new Date(),
//           },
//         });

//         // Increment workspace subscriber count
//         await db.workspace.update({
//           where: { id: workspaceId },
//           data: {
//             currentSubscribers: { increment: 1 }
//           }
//         });

//         // Send welcome email in background
//         sendWelcomeEmail({ workspaceId, subscriber: updated, templateId }).catch(e => console.error(e));

//         return addCORSHeaders(NextResponse.json({
//           success: true,
//           message: "Subscription reactivated",
//           subscriber: updated
//         }));
//       }
//     }

//     // 5. Create new subscriber
//     const subscriber = await db.subscriber.create({
//       data: {
//         id: dropid('sub'),
//         workspaceId,
//         email,
//         name: name || null,
//         status: 'ACTIVE',
//         source,
//         segments: ['newsletter'],
//         confirmedAt: new Date(),
//         customFields: {
//           subscribedAt: new Date().toISOString(),
//           source,
//         },
//       },
//     });

//     // Increment workspace subscriber count
//     await db.workspace.update({
//       where: { id: workspaceId },
//       data: {
//         currentSubscribers: { increment: 1 }
//       }
//     });

//     // Create a usage log for analytics
//     await db.usageLog.create({
//       data: {
//         id: dropid('ulg'),
//         workspaceId,
//         service: 'SUBSCRIBER',
//         month: new Date().toISOString().slice(0, 7),
//         currentSubscribers: workspace.currentSubscribers + 1,
//         createdAt: new Date(),
//       }
//     });

//     // Send welcome email in background
//     sendWelcomeEmail({ workspaceId, subscriber, templateId }).catch(e => console.error(e));

//     const response = NextResponse.json(
//       { 
//         success: true, 
//         message: "Subscription successful",
//         subscriber 
//       },
//       { status: 201 }
//     );
//     return addCORSHeaders(response);

//   } catch (error) {
//     console.error("[V1_SUBSCRIBE_ERROR]", error);
//     const response = NextResponse.json(
//       { success: false, error: "Internal server error" },
//       { status: 500 }
//     );
//     return addCORSHeaders(response);
//   }
// }
