// app/api/workspace/[workspaceId]/email/[emailId]/retry/route.ts
import { db } from '@/lib/db';
import { mailSender } from '@/lib/email/service/transporter';
import { err, ok, serverError } from '@/lib/respond/response';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
    { params }: { params: Promise<{ workspaceId: string; emailId: string }> }
) {
  try {

    const { workspaceId, emailId } = await params;
    // Get the original email
    const originalEmail = await db.email.findFirst({
      where: {
        id: emailId,
        workspaceId: workspaceId
      }
    });


    if (!originalEmail) {
      return err('Email not found', 403
      );
    }

    // Create a new email record for retry
    const newEmail = await db.email.create({
      data: {
        workspaceId: workspaceId,
        fromEmail: originalEmail.fromEmail,
        fromName: originalEmail.fromName,
        toEmails: originalEmail.toEmails,
        ccEmails: originalEmail.ccEmails,
        bccEmails: originalEmail.bccEmails,
        subject: `[RETRY] ${originalEmail.subject}`,
        bodyHtml: originalEmail.bodyHtml,
        bodyText: originalEmail.bodyText,
        mailSentFrom: originalEmail.mailSentFrom,
        status: 'PENDING',
        metadata: {
          ...(originalEmail.metadata as object || {}),
          retryOf: emailId,
          retryCount: ((originalEmail.metadata as any)?.retryCount || 0) + 1
        }
      }
    });

    // Attempt to send the email
    try {

         const result = await mailSender.sendEmail({
                to: originalEmail.toEmails,
                cc: originalEmail.ccEmails,
                bcc: originalEmail.bccEmails,
                subject: `[RETRY] ${originalEmail.subject}`,
                html: originalEmail.bodyHtml || '',
                text: originalEmail.bodyText || '',
                fromEmail: originalEmail.fromEmail,         // Use sender from workspace
                workspaceId: originalEmail.workspaceId,
            });
        

      // Update status to delivered
      await db.email.update({
        where: { id: newEmail.id },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date()
        }
      });
    } catch (error) {
      // Update status to bounced
      await db.email.update({
        where: { id: newEmail.id },
        data: {
          status: 'BOUNCED',
          bouncedAt: new Date(),
          bounceReason: (error as Error).message
        }
      });
    }

    return ok({data: newEmail });
  } catch (error) {
    console.error('Error retrying email:', error);
    return serverError();
  }
}