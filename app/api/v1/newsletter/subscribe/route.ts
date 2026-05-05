import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { validateApiKey } from "@/lib/api-key/validate";
import { handleCORS, addCORSHeaders } from "@/lib/cors";
import { dropid } from "dropid";
import { welcomeEmail } from "@/lib/email/service/newsletter-welcome-email.service";

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
  try {
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

    // 3. Check workspace and limits
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        subscriberLimit: true,
        currentSubscribers: true,
      }
    });

    if (!workspace) {
      return addCORSHeaders(NextResponse.json(
        { success: false, error: "Workspace not found" },
        { status: 404 }
      ));
    }

    if (workspace.currentSubscribers >= workspace.subscriberLimit) {
      return addCORSHeaders(NextResponse.json(
        { success: false, error: "Workspace has reached its subscriber limit" },
        { status: 403 }
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

        // Increment workspace subscriber count
        await db.workspace.update({
          where: { id: workspaceId },
          data: {
            currentSubscribers: { increment: 1 }
          }
        });

        // Send welcome email in background
        sendWelcomeEmail({ workspaceId, subscriber: updated, templateId }).catch(e => console.error(e));

        return addCORSHeaders(NextResponse.json({
          success: true,
          message: "Subscription reactivated",
          subscriber: updated
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

    // Increment workspace subscriber count
    await db.workspace.update({
      where: { id: workspaceId },
      data: {
        currentSubscribers: { increment: 1 }
      }
    });

    // Create a usage log for analytics
    await db.usageLog.create({
      data: {
        id: dropid('ulg'),
        workspaceId,
        service: 'SUBSCRIBER',
        month: new Date().toISOString().slice(0, 7),
        currentSubscribers: workspace.currentSubscribers + 1,
        createdAt: new Date(),
      }
    });

    // Send welcome email in background
    sendWelcomeEmail({ workspaceId, subscriber, templateId }).catch(e => console.error(e));

    const response = NextResponse.json(
      { 
        success: true, 
        message: "Subscription successful",
        subscriber 
      },
      { status: 201 }
    );
    return addCORSHeaders(response);

  } catch (error) {
    console.error("[V1_SUBSCRIBE_ERROR]", error);
    const response = NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
    return addCORSHeaders(response);
  }
}
