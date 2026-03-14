import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { z } from "zod";
import { validateApiKey } from "@/lib/api-key/validate";
import { checkWorkspaceOTPLimit, getWorkspaceEmailSender } from "@/lib/v1-api/workspace/sender";
import { generateOTP, getDefaultOTPTemplate, getDefaultTextTemplate, hashOTP } from "@/lib/v1-api/otp/utils";
import { mailSender } from "@/lib/email/service/transporter";

// Validation schema for resend OTP request
const resendOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  otpId: z.string().optional(), // Optional: specific OTP request to resend
  subject: z.string().optional(),
  html: z.string().optional(),
  text: z.string().optional(),
  length: z.number().min(4).max(8).optional(),
  expiry: z.number().min(1).max(60).optional(),
  metadata: z.record(z.any()).optional(),
  brandName: z.string().optional(),
  customFields: z.record(z.string()).optional(),
  reason: z.enum(['expired', 'not_received', 'new_request']).optional().default('new_request'),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Validate API key
    const validation = await validateApiKey(req);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: validation.status || 401 }
      );
    }

    const { keyInfo } = validation;
    if (!keyInfo) {
      return NextResponse.json(
        { success: false, error: "Invalid API key information" },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await req.json();
    const parsed = resendOTPSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: parsed.error.errors,
        },
        { status: 400 }
      );
    }

    const { 
      email, 
      otpId,
      subject, 
      html, 
      text,
      length = 6, 
      expiry = 10, 
      metadata,
      brandName,
      customFields,
      reason
    } = parsed.data;

    // 3. Check if there's an existing pending OTP for this email
    const existingOTP = await db.otpRequest.findFirst({
      where: {
        workspaceId: keyInfo.workspaceId,
        recipient: email,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 4. If there's a valid pending OTP and no specific otpId requested, inform the user
    if (existingOTP && !otpId && reason !== 'new_request') {
      const timeRemaining = Math.ceil((existingOTP.expiresAt.getTime() - Date.now()) / 60000);
      
      return NextResponse.json(
        {
          success: false,
          error: "Active OTP exists",
          details: {
            message: `An active OTP already exists and will expire in ${timeRemaining} minutes`,
            otpId: existingOTP.id,
            expiresAt: existingOTP.expiresAt.toISOString(),
            remainingMinutes: timeRemaining,
          },
        },
        { status: 409 } // Conflict
      );
    }

    // 5. Check workspace OTP limit
    const limitCheck = await checkWorkspaceOTPLimit(keyInfo.workspaceId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "OTP limit exceeded",
          limit: limitCheck.limit,
          current: limitCheck.current,
          remaining: limitCheck.remaining,
        },
        { status: 429 }
      );
    }

    // 6. Get workspace sender
    const sender = await getWorkspaceEmailSender(keyInfo.workspaceId);
    if (!sender) {
      return NextResponse.json(
        { success: false, error: "No email sender configured for workspace" },
        { status: 400 }
      );
    }

    // 7. Generate new OTP
    const otp = generateOTP(length);
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + expiry * 60 * 1000);

    // 8. If an otpId was provided, mark the old OTP as expired (optional)
    if (otpId) {
      await db.otpRequest.updateMany({
        where: {
          id: otpId,
          workspaceId: keyInfo.workspaceId,
        },
        data: {
          status: 'EXPIRED',
          metadata: {
            ...(existingOTP?.metadata as Record<string, any> || {}),
            expiredBy: 'resend',
            expiredAt: new Date().toISOString(),
          },
        },
      }).catch(() => {
        // Ignore error if OTP not found
        console.log(`[OTP_RESEND] Could not expire OTP: ${otpId}`);
      });
    }

    // 9. Create new OTP record
    const newOtpId = dropid("otp");
    const otpRecord = await db.otpRequest.create({
      data: {
        id: newOtpId,
        workspaceId: keyInfo.workspaceId,
        channel: "EMAIL",
        recipient: email,
        otpLength: length,
        otpHash,
        validityMins: expiry,
        status: 'PENDING',
        expiresAt,
        maxAttempts: 3,
        metadata: {
          ...metadata,
          apiKeyId: keyInfo.id,
          apiKeyName: keyInfo.name,
          isTestKey: keyInfo.isTest,
          brandName,
          customFields,
          previousOtpId: otpId || existingOTP?.id,
          resendReason: reason,
          resendCount: existingOTP ? ((existingOTP.metadata as any)?.resendCount || 0) + 1 : 0,
        },
      },
    });

    // 10. Prepare email content
    const companyName = brandName || sender.name || "DropAPHI";
    
    // Process HTML: replace placeholders if custom HTML is provided
    let emailHtml = html;
    let emailText = text;
    
    // Add resend notice to email content
    const resendNotice = reason === 'expired' 
      ? "We noticed your previous code expired, so we've sent you a new one." 
      : reason === 'not_received'
      ? "You requested a new code because you didn't receive the previous one."
      : "As requested, here's your new verification code.";

    if (emailHtml) {
      // Replace placeholders in custom HTML
      const placeholders: Record<string, string> = {
        '{{otp}}': otp,
        '{{company}}': companyName,
        '{{expiry}}': expiry.toString(),
        '{{email}}': email,
        '{{resend_notice}}': resendNotice,
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
        emailText = `Your verification code is: ${otp}\n\n${resendNotice}`;
      }
    } else {
      // Use default templates with resend notice
      const defaultHtml = getDefaultOTPTemplate(otp, companyName);
      emailHtml = defaultHtml.replace('</body>', `<p style="color: #667eea; font-style: italic;">${resendNotice}</p>\n</body>`);
      emailText = text || `${getDefaultTextTemplate(otp)}\n\n${resendNotice}`;
    }

    // 11. Prepare email subject (add [Resent] tag if applicable)
    const emailSubject = subject 
      ? (reason !== 'new_request' ? `[Resent] ${subject}` : subject)
      : (reason !== 'new_request' ? `[Resent] Your verification code: ${otp}` : `Your verification code: ${otp}`);

    // 12. Send email
    const emailResult = await mailSender.sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      fromEmail: sender.email,
      fromName: sender.name,
      replyTo: sender.replyTo,
      headers: {
        "X-OTP-ID": newOtpId,
        "X-Workspace-ID": keyInfo.workspaceId,
        "X-API-Key-ID": keyInfo.id,
        "X-OTP-Resend": "true",
        "X-OTP-Reason": reason || "new_request",
      },
    });

    if (!emailResult.success) {
      // Update OTP record as failed
      await db.otpRequest.update({
        where: { id: newOtpId },
        data: {
          status: "FAILED",
          metadata: {
            ...(otpRecord.metadata as Record<string, any>),
            error: emailResult.error,
          },
        },
      });

      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to resend OTP email",
          details: emailResult.error 
        },
        { status: 500 }
      );
    }

    // 13. Update workspace OTP count
    await db.workspace.update({
      where: { id: keyInfo.workspaceId },
      data: {
        currentOtpSent: { increment: 1 },
      },
    });

    // 14. Log API usage
    await db.aPiUsageSummary.upsert({
      where: {
        workspaceId_date_service: {
          workspaceId: keyInfo.workspaceId,
          date: new Date(),
          service: "otp_resend",
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
        service: "otp_resend",
        totalCalls: 1,
        successCalls: 1,
        failedCalls: 0,
      },
    });

    // 15. Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          id: newOtpId,
          message: `OTP resent successfully to ${email}`,
          expiresAt: expiresAt.toISOString(),
          previousOtpId: otpId || existingOTP?.id,
          resendCount: existingOTP ? ((existingOTP.metadata as any)?.resendCount || 0) + 1 : 1,
          // For testing only - remove in production
          ...(process.env.NODE_ENV === "development" && { debug: { otp } }),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[V1_OTP_RESEND_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}