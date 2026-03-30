import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { z } from "zod";
import { validateApiKey } from "@/lib/api-key/validate";
import { checkWorkspaceEmailLimit, getWorkspaceEmailSender } from "@/lib/v1-api/workspace/sender";
import { defaultTemplates, htmlToText, processTemplate } from "@/lib/v1-api/email/template";
import { mailSender } from "@/lib/email/service/transporter";
import { handleCORS, addCORSHeaders } from "@/lib/cors"; // Add this import

// Validation schema for send email request
const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  subject: z.string().min(1, "Subject is required"),
  html: z.string().optional(),
  text: z.string().optional(),
  brandName: z.string().optional( ),
  template: z.enum(["welcome", "newsletter", "marketing", "notification"]).optional(),
  templateData: z.record(z.any()).optional(),
  fromName: z.string().optional(),
  replyTo: z.string().email().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(), // base64 encoded
    contentType: z.string().optional(),
  })).optional(),
  headers: z.record(z.string()).optional(),
  scheduledAt: z.string().datetime().optional(),
  tracking: z.object({
    opens: z.boolean().default(true),
    clicks: z.boolean().default(true),
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return handleCORS(req);
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
      const response = NextResponse.json(
        { success: false, error: "Invalid API key information" },
        { status: 401 }
      );
      return addCORSHeaders(response);
    }

    // 2. Parse and validate request body
    const body = await req.json();
    const parsed = sendEmailSchema.safeParse(body);

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

    const {
      to,
      cc,
      bcc,
      subject,
      html,
      text,
      template,
      templateData,
      fromName,
      replyTo,
      brandName,
      attachments,
      headers,
      scheduledAt,
      tracking,
      metadata,
    } = parsed.data;

    // 3. Check workspace email limit
    const limitCheck = await checkWorkspaceEmailLimit(keyInfo.workspaceId);
    if (!limitCheck.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Email limit exceeded",
          limit: limitCheck.limit,
          current: limitCheck.current,
          remaining: limitCheck.remaining,
        },
        { status: 429 }
      );
      return addCORSHeaders(response);
    }

    // 4. Get workspace sender
    const sender = await getWorkspaceEmailSender(keyInfo.workspaceId);
    if (!sender) {
      const response = NextResponse.json(
        { success: false, error: "No email sender configured for workspace" },
        { status: 400 }
      );
      return addCORSHeaders(response);
    }

    // 5. Prepare email content
    let emailHtml = html;
    let emailText = text;

    // If template is specified, use it
    if (template && defaultTemplates[template]) {
      const templateVariables = {
        company: sender.name,
        ...templateData,
      };
      
      emailHtml = defaultTemplates[template](templateVariables);
      
      if (!emailText) {
        emailText = htmlToText(emailHtml);
      }
    }

    // If no HTML provided, create a simple one
    if (!emailHtml) {
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            ${emailText || subject}
          </div>
        </body>
        </html>
      `;
    }

    // 6. Process any remaining variables
    if (templateData) {
      emailHtml = processTemplate(emailHtml, templateData);
      if (emailText) {
        emailText = processTemplate(emailText, templateData);
      }
    }

    // 7. Prepare recipients
    const toEmails = Array.isArray(to) ? to : [to];
    const ccEmails = cc ? (Array.isArray(cc) ? cc : [cc]) : [];
    const bccEmails = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [];

    // 8. Create email record
    const emailId = dropid("eml");
    const emailRecord = await db.email.create({
      data: {
        id: emailId,
        workspaceId: keyInfo.workspaceId,
        emailSenderId: sender.id !== "system" ? sender.id : null,
        fromEmail: sender.email,
        fromName: brandName ||fromName || sender.name,
        toEmails,
        ccEmails,
        bccEmails,
        subject,
        bodyHtml: emailHtml,
        bodyText: emailText || htmlToText(emailHtml),
        status: scheduledAt ? "SCHEDULED" : "PENDING",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        mailSentFrom: "API",
        metadata: {
          ...metadata,
          apiKeyId: keyInfo.id,
          apiKeyName: keyInfo.name,
          isTestKey: keyInfo.isTest,
          template,
          tracking,
        },
      },
    });

    // 9. If scheduled, don't send now
    if (scheduledAt) {
      const response = NextResponse.json(
        {
          success: true,
          data: {
            id: emailRecord.id,
            status: "SCHEDULED",
            scheduledAt,
            message: "Email scheduled successfully",
          },
        },
        { status: 202 }
      );
      return addCORSHeaders(response);
    }

    // 10. Process attachments (decode from base64)
    const processedAttachments = attachments?.map(att => ({
      filename: att.filename,
      content: Buffer.from(att.content, 'base64'),
      contentType: att.contentType,
    }));

    console.log(sender.name, 'sender name sendemail ')

    // 11. Send email
    const emailResult = await mailSender.sendEmail({
      to: toEmails,
      cc: ccEmails,
      bcc: bccEmails,
      subject,
      html: emailHtml,
      text: emailText || htmlToText(emailHtml),
      fromEmail: sender.email,
      fromName:  sender.name || brandName || fromName ,
      // replyTo: replyTo || sender.replyTo,
      attachments: processedAttachments,
      headers: {
        "X-Email-ID": emailId,
        "X-Workspace-ID": keyInfo.workspaceId,
        "X-API-Key-ID": keyInfo.id,
        "X-Tracking-ID": emailId,
        ...headers,
      },
    });

    if (!emailResult.success) {
      // Update email record as failed
      await db.email.update({
        where: { id: emailId },
        data: {
          status: "FAILED",
          bounceReason: emailResult.error,
        },
      });

      const response = NextResponse.json(
        { 
          success: false, 
          error: "Failed to send email",
          details: emailResult.error 
        },
        { status: 500 }
      );
      return addCORSHeaders(response);
    }

    // 12. Update email record as delivered
    await db.email.update({
      where: { id: emailId },
      data: {
        status: "DELIVERED",
        providerRef: emailResult.messageId,
        deliveredAt: new Date(),
      },
    });

    // 13. Update workspace email count
    await db.workspace.update({
      where: { id: keyInfo.workspaceId },
      data: {
        currentEmailsSent: { increment: 1 },
      },
    });

    // 14. Log API usage
    await db.aPiUsageSummary.upsert({
      where: {
        workspaceId_date_service: {
          workspaceId: keyInfo.workspaceId,
          date: new Date(),
          service: "email_send",
        },
      },
      update: {
        totalCalls: { increment: 1 },
        successCalls: { increment: 1 },
      },
      create: {
        id: dropid("aus"),
        workspaceId: keyInfo.workspaceId,
        apiKeyId: keyInfo.id,
        date: new Date(),
        service: "email_send",
        totalCalls: 1,
        successCalls: 1,
        failedCalls: 0,
      },
    });

    // 15. Return success response
    const response = NextResponse.json(
      {
        success: true,
        data: {
          id: emailRecord.id,
          messageId: emailResult.messageId,
          status: "SENT",
          to: toEmails.length,
          message: "Email sent successfully",
        },
      },
      { status: 200 }
    );
    return addCORSHeaders(response);
    
  } catch (error) {
    console.error("[V1_EMAIL_SEND_ERROR]", error);
    
    const response = NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
    return addCORSHeaders(response);
  }
}