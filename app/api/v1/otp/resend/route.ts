// app/api/v1/otp/resend/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { z } from "zod";
import { validateApiKey } from "@/lib/api-key/validate";
import { checkWorkspaceOTPLimit, getWorkspaceEmailSender } from "@/lib/v1-api/workspace/sender";
import { generateOTP, encryptOTP, getDefaultOTPTemplate, getDefaultTextTemplate } from "@/lib/v1-api/otp/utils";
import { handleCORS, addCORSHeaders } from "@/lib/cors";
import { emailSender } from "@/lib/v1-api/email/OtpTransporter";

// Helper function to get start of day
function getStartOfDay(date: Date = new Date()): Date {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

// Validation schema for regenerate OTP request
const regenerateOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  subject: z.string().optional(),
  html: z.string().optional(),
  text: z.string().optional(),
  length: z.number().min(4).max(8).default(6),
  expiry: z.number().min(1).max(60).default(10),
  metadata: z.record(z.any()).optional(),
  brandName: z.string().optional(),
  customFields: z.record(z.string()).optional(),
  reason: z.enum(['expired', 'not_received', 'new_request']).optional().default('not_received'),
});

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
    const parsed = regenerateOTPSchema.safeParse(body);

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
      email, 
      subject, 
      html, 
      text,
      length, 
      expiry, 
      metadata,
      brandName,
      customFields,
      reason
    } = parsed.data;

    // 3. Check rate limiting (prevent spam)
    const recentOTP = await db.otpRequest.findFirst({
      where: {
        workspaceId: keyInfo.workspaceId,
        recipient: email,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) } // Last 60 seconds
      },
      orderBy: { createdAt: 'desc' }
    });

    if (recentOTP) {
      const secondsSinceLast = Math.ceil((Date.now() - recentOTP.createdAt.getTime()) / 1000);
      const waitSeconds = 60 - secondsSinceLast;
      
      if (waitSeconds > 0) {
        const response = NextResponse.json(
          {
            success: false,
            error: "Please wait before requesting another code",
            details: {
              message: `You can request another code in ${waitSeconds} seconds`,
              nextAttemptIn: waitSeconds,
            },
          },
          { status: 429 }
        );
        return addCORSHeaders(response);
      }
    }

    // 4. Check workspace OTP limit
    const limitCheck = await checkWorkspaceOTPLimit(keyInfo.workspaceId);
    if (!limitCheck.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          error: "OTP limit exceeded",
          limit: limitCheck.limit,
          current: limitCheck.current,
          remaining: limitCheck.remaining,
        },
        { status: 429 }
      );
      return addCORSHeaders(response);
    }

    // 5. Get workspace sender
    const sender = await getWorkspaceEmailSender(keyInfo.workspaceId);
    if (!sender) {
      const response = NextResponse.json(
        { success: false, error: "No email sender configured for workspace" },
        { status: 400 }
      );
      return addCORSHeaders(response);
    }

    // 6. Mark any existing pending OTPs as expired/regenerated
    await db.otpRequest.updateMany({
      where: {
        workspaceId: keyInfo.workspaceId,
        recipient: email,
        status: 'PENDING',
        expiresAt: { gt: new Date() }
      },
      data: {
        status: 'EXPIRED',
        metadata: {
          regeneratedAt: new Date().toISOString(),
          regeneratedReason: reason
        }
      }
    });

    // 7. Generate NEW OTP
    const otp = generateOTP(length);
    const otpEncrypted = encryptOTP(otp);
    const expiresAt = new Date(Date.now() + expiry * 60 * 1000);

    // 8. Create new OTP record
    const otpId = dropid("otp");
    const otpRecord = await db.otpRequest.create({
      data: {
        id: otpId,
        workspaceId: keyInfo.workspaceId,
        channel: "EMAIL",
        recipient: email,
        otpLength: length,
        otpEncrypted,
        validityMins: expiry,
        status: 'PENDING',
        expiresAt,
        maxAttempts: 3,
        resentCount: 0,
        metadata: {
          ...metadata,
          apiKeyId: keyInfo.id,
          apiKeyName: keyInfo.name,
          isTestKey: keyInfo.isTest,
          brandName,
          customFields,
          regenerated: true,
          regeneratedReason: reason,
          previousOtpExpired: true
        },
      },
    });

    // 9. Prepare email content
    const companyName = brandName || sender.name || "RTAS";
    
    let emailHtml = html;
    let emailText = text;
    
    // Customize message based on reason
    const messagePrefix = reason === 'expired' 
      ? "Your previous code has expired. Here's a new one:" 
      : reason === 'not_received'
      ? "Here's a new verification code:"
      : "As requested, here's your new verification code:";

    if (emailHtml) {
      const placeholders: Record<string, string> = {
        '{{otp}}': otp,
        '{{company}}': companyName,
        '{{expiry}}': expiry.toString(),
        '{{email}}': email,
        '{{message_prefix}}': messagePrefix,
        ...customFields,
      };
      
      Object.entries(placeholders).forEach(([key, value]) => {
        emailHtml = emailHtml!.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
      });
      
      if (emailText) {
        Object.entries(placeholders).forEach(([key, value]) => {
          emailText = emailText!.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
        });
      } else {
        emailText = `${messagePrefix}\n\nYour verification code is: ${otp}\n\nThis code will expire in ${expiry} minutes.`;
      }
    } else {
      // Use default template with regeneration message
      emailHtml = getDefaultOTPTemplate(otp, companyName);
      // Add regeneration message
      emailHtml = emailHtml.replace(
        '<p>Your verification code is:</p>',
        `<p>${messagePrefix}</p>\n<p>Your new verification code is:</p>`
      );
      emailText = text || `${messagePrefix}\n\nYour verification code is: ${otp}\n\nThis code will expire in ${expiry} minutes.`;
    }

    // 10. Prepare email subject
    const emailSubject = subject || `New verification code for ${companyName}`;

    // 11. Send email with new OTP
    const emailResult = await emailSender.sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      fromEmail: sender.email,
      fromName: sender.name,
      replyTo: sender.replyTo,
      headers: {
        "X-OTP-ID": otpRecord.id,
        "X-Workspace-ID": keyInfo.workspaceId,
        "X-API-Key-ID": keyInfo.id,
        "X-OTP-Regenerate": "true",
        "X-OTP-Reason": reason,
      },
    });

    if (!emailResult.success) {
      // Mark OTP as failed
      await db.otpRequest.update({
        where: { id: otpId },
        data: {
          status: "FAILED",
          metadata: {
            ...(otpRecord.metadata as Record<string, any>),
            error: emailResult.error,
          },
        },
      });

      const response = NextResponse.json(
        { 
          success: false, 
          error: "Failed to send OTP email",
          details: emailResult.error 
        },
        { status: 500 }
      );
      return addCORSHeaders(response);
    }

    // 12. Update workspace OTP count
    await db.workspace.update({
      where: { id: keyInfo.workspaceId },
      data: {
        currentOtpSent: { increment: 1 },
      },
    });

    // 13. Track API usage
    const today = getStartOfDay();
    await db.aPiUsageSummary.upsert({
      where: {
        workspaceId_date_service: {
          workspaceId: keyInfo.workspaceId,
          date: today,
          service: "otp_regenerate",
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
        date: today,
        service: "otp_regenerate",
        totalCalls: 1,
        successCalls: 1,
        failedCalls: 0,
      },
    });

    // 14. Return success response
    const response = NextResponse.json(
      {
        success: true,
        data: {
          id: otpRecord.id,
          message: `New verification code sent to ${email}`,
          expiresAt: expiresAt.toISOString(),
          regenerated: true,
          ...(process.env.NODE_ENV === "development" && { debug: { otp } }),
        },
      },
      { status: 200 }
    );
    
    return addCORSHeaders(response);
    
  } catch (error) {
    console.error("[V1_OTP_REGENERATE_ERROR]", error);
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