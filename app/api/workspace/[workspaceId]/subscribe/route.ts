import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { 
  ok, 
  err, 
  notFound, 
  validationError, 
  serverError,
  created,
} from "@/lib/respond/response";
import { dropid } from "dropid";
import { welcomeEmail } from "@/lib/email/service/newsletter-welcome-email.service";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  source: z.string().default("website"),
  templateId: z.string().optional(), 
});

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
        // You can add any custom variables here
        source: 'subscription_page',
        subscription_date: new Date().toISOString(),
      }
    });

    if (!result.success) {
      console.error('[SUBSCRIBE] Welcome email failed:', result.error);
      // Log but don't throw - subscription should still succeed
    } else {
      console.log('[SUBSCRIBE] Welcome email sent:', result.messageId);
    }

    return result;
  } catch (error) {
    console.error('[SUBSCRIBE] Error sending welcome email:', error);
    // Don't throw - subscription should still succeed
    return { success: false, error: (error as Error).message };
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

    // Check if workspace exists
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
      return notFound("Workspace not found");
    }

    // Check if workspace has reached subscriber limit
    if (workspace.currentSubscribers >= workspace.subscriberLimit) {
      return err("Workspace has reached its subscriber limit");
    }

    // Parse and validate request body
    const body = await req.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { email, name, source, templateId } = parsed.data;

    // Check if subscriber already exists
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
        return err("Email already subscribed", 409, "ALREADY_SUBSCRIBED");
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
            currentSubscribers: {
              increment: 1
            }
          }
        });

        // Send welcome email on reactivation (fire and forget - don't await)
        sendWelcomeEmail({ 
          workspaceId, 
          subscriber: updated, 
          templateId 
        }).catch(error => {
          console.error('[SUBSCRIBE] Background welcome email failed:', error);
        });
        
        return ok(
          { subscriber: updated },
          "Subscription reactivated successfully. Welcome email sent!"
        );
      }
    }

    // Create new subscriber
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
        currentSubscribers: {
          increment: 1
        }
      }
    });

    // Create a usage log for analytics
    await db.usageLog.create({
      data: {
        id: dropid('ulg'),
        workspaceId,
        service: 'SUBSCRIBER',
        month: new Date().toISOString().slice(0, 7), // YYYY-MM format
        currentSubscribers: workspace.currentSubscribers + 1,
        currentEmailsSent: 0,
        currentFilesUsed: 0,
        currentSmsSent: 0,
        currentOtpSent: 0,
        createdAt: new Date(),
      }
    });

    // Send welcome email (fire and forget - don't await to avoid blocking response)
    // This runs in the background while the response is sent to the user
    Promise.resolve().then(async () => {
      try {
        await sendWelcomeEmail({ 
          workspaceId, 
          subscriber, 
          templateId 
        });
      } catch (error) {
        console.error('[SUBSCRIBE] Background welcome email failed:', error);
      }
    });

    // Get updated workspace data to return
    const updatedWorkspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        currentSubscribers: true,
        subscriberLimit: true,
      }
    });

    // Return success immediately without waiting for email
    return created(
      { 
        subscriber,
        workspace: updatedWorkspace
      },
      "Subscription successful! Welcome email sent."
    );

  } catch (error) {
    console.error("[SUBSCRIBE_ERROR]", error);
    return serverError();
  }
}



