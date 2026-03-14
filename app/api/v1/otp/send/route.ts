import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { z } from "zod";
import { validateApiKey } from "@/lib/api-key/validate";
import { checkWorkspaceOTPLimit, getWorkspaceEmailSender } from "@/lib/v1-api/workspace/sender";
import { generateOTP, getDefaultOTPTemplate, getDefaultTextTemplate, hashOTP } from "@/lib/v1-api/otp/utils";
import { mailSender } from "@/lib/email/service/transporter";


// Validation schema for send OTP request
const sendOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  subject: z.string().optional(),
  html: z.string().optional(),
  text: z.string().optional(),
  length: z.number().min(4).max(8).default(6),
  expiry: z.number().min(1).max(60).default(10), // minutes
  metadata: z.record(z.any()).optional(),
  brandName: z.string().optional(),
  customFields: z.record(z.string()).optional(),
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
    const parsed = sendOTPSchema.safeParse(body);

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
      subject, 
      html, 
      text,
      length, 
      expiry, 
      metadata,
      brandName,
      customFields
    } = parsed.data;

    // 3. Check workspace OTP limit
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

    // 4. Get workspace sender
    const sender = await getWorkspaceEmailSender(keyInfo.workspaceId);
    if (!sender) {
      return NextResponse.json(
        { success: false, error: "No email sender configured for workspace" },
        { status: 400 }
      );
    }

    // 5. Generate OTP
    const otp = generateOTP(length);
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + expiry * 60 * 1000);

    // 6. Create OTP record
    const otpId = dropid("otp");
    const otpRecord = await db.otpRequest.create({
      data: {
        id: otpId,
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
        },
      },
    });

    // 7. Prepare email content
    const companyName = brandName || sender.name || "DropAPHI";
    
    // Process HTML: replace placeholders if custom HTML is provided
    let emailHtml = html;
    let emailText = text;
    
    if (emailHtml) {
      // Replace placeholders in custom HTML
      const placeholders: Record<string, string> = {
        '{{otp}}': otp,
        '{{company}}': companyName,
        '{{expiry}}': expiry.toString(),
        '{{email}}': email,
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
        emailText = `Your verification code is: ${otp}`;
      }
    } else {
      // Use default templates
      emailHtml = getDefaultOTPTemplate(otp, companyName);
      emailText = text || getDefaultTextTemplate(otp);
    }

    // 8. Prepare email subject
    const emailSubject = subject || `Your verification code: ${otp}`;

    // 9. Send email
    const emailResult = await mailSender.sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      fromEmail: sender.email,
      fromName: sender.name,
      replyTo: sender.replyTo,
      headers: {
        "X-OTP-ID": otpId,
        "X-Workspace-ID": keyInfo.workspaceId,
        "X-API-Key-ID": keyInfo.id,
      },
    });

    if (!emailResult.success) {
      // Update OTP record as failed
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

      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to send OTP email",
          details: emailResult.error 
        },
        { status: 500 }
      );
    }

    // 10. Update workspace OTP count
    await db.workspace.update({
      where: { id: keyInfo.workspaceId },
      data: {
        currentOtpSent: { increment: 1 },
      },
    });

    // 11. Log API usage
    await db.aPiUsageSummary.upsert({
      where: {
        workspaceId_date_service: {
          workspaceId: keyInfo.workspaceId,
          date: new Date(),
          service: "otp_send",
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
        service: "otp_send",
        totalCalls: 1,
        successCalls: 1,
        failedCalls: 0,
      },
    });

    // 12. Return success response (NEVER return the OTP in production!)
    return NextResponse.json(
      {
        success: true,
        data: {
          id: otpRecord.id,
          message: `OTP sent successfully to ${email}`,
          expiresAt: expiresAt.toISOString(),
          // For testing only - remove in production
          ...(process.env.NODE_ENV === "development" && { debug: { otp } }),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[V1_OTP_SEND_ERROR]", error);
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

// Add OPTIONS for CORS
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