import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleCORS, addCORSHeaders } from "@/lib/cors";

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return handleCORS(req);
}

/**
 * GET /api/unsubscribe
 * Public unsubscribe endpoint
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const workspaceId = searchParams.get("workspace");

    if (!email) {
      return addCORSHeaders(
        NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
      );
    }

    // 1. Find the subscriber
    const where: any = { email };
    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    const subscriber = await db.subscriber.findFirst({
      where: {
        email,
        workspaceId: workspaceId || undefined,
        status: 'ACTIVE'
      }
    });

    if (!subscriber) {
       // If not found or already unsubscribed, we still show success to avoid email harvesting
       // and because the end goal is achieved.
       return new NextResponse(
         `<html>
            <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f9fafb;">
              <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h1 style="color: #111827; margin-bottom: 1rem;">Unsubscribed</h1>
                <p style="color: #4b5563;">You have been successfully unsubscribed from this list.</p>
              </div>
            </body>
          </html>`,
         {
           headers: { "Content-Type": "text/html" },
         }
       );
    }

    // 2. Mark as unsubscribed
    await db.subscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
      }
    });

    // 3. Decrement workspace subscriber count
    await db.workspace.update({
      where: { id: subscriber.workspaceId },
      data: {
        currentSubscribers: { decrement: 1 }
      }
    });

    // 4. Return success page
    return new NextResponse(
      `<html>
         <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f9fafb;">
           <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
             <h1 style="color: #111827; margin-bottom: 1rem;">Unsubscribed</h1>
             <p style="color: #4b5563;">You have been successfully unsubscribed from <b>${subscriber.email}</b>.</p>
             <p style="color: #6b7280; font-size: 0.875rem; margin-top: 1.5rem;">We're sorry to see you go.</p>
           </div>
         </body>
       </html>`,
      {
        headers: { "Content-Type": "text/html" },
      }
    );

  } catch (error) {
    console.error("[UNSUBSCRIBE_ERROR]", error);
    return new NextResponse(
      `<html>
         <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f9fafb;">
           <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
             <h1 style="color: #dc2626; margin-bottom: 1rem;">Error</h1>
             <p style="color: #4b5563;">An error occurred while processing your request. Please try again later.</p>
           </div>
         </body>
       </html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}
