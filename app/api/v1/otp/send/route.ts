// app/api/v1/otp/send/route.ts
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

// Validation schema for send OTP request
const sendOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  subject: z.string().optional(),
  html: z.string().optional(),
  text: z.string().optional(),
  length: z.number().min(4).max(8).default(6),
  expiry: z.number().min(1).max(60).default(10),
  metadata: z.record(z.any()).optional(),
  brandName: z.string().optional(),
  customFields: z.record(z.string()).optional(),
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
    const parsed = sendOTPSchema.safeParse(body);

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
      customFields
    } = parsed.data;

    // 3. Get workspace sender (do this first to fail fast)
    const sender = await getWorkspaceEmailSender(keyInfo.workspaceId);
    if (!sender) {
      const response = NextResponse.json(
        { success: false, error: "No email sender configured for workspace" },
        { status: 400 }
      );
      return addCORSHeaders(response);
    }

    // 4. CRITICAL: Check for ANY existing active OTP for this email
    const existingActiveOTP = await db.otpRequest.findFirst({
      where: {
        workspaceId: keyInfo.workspaceId,
        recipient: email,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    });

    // If there's an active OTP, return error
    if (existingActiveOTP) {
      const timeRemaining = Math.ceil((existingActiveOTP.expiresAt.getTime() - Date.now()) / 60000);
      
      const response = NextResponse.json(
        {
          success: false,
          error: "Active OTP code exists",
          details: {
            message: "An active verification code has already been sent to this email",
            expiresIn: `${timeRemaining} minutes`,
            expiresAt: existingActiveOTP.expiresAt.toISOString(),
            // Don't include the OTP in response for security
          },
        },
        { status: 409 } // 409 Conflict
      );
      return addCORSHeaders(response);
    }

    // 5. Check workspace OTP limit
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

    // 6. Generate OTP
    const otp = generateOTP(length);
    const otpEncrypted = encryptOTP(otp);
    const expiresAt = new Date(Date.now() + expiry * 60 * 1000);

    // 7. Create OTP record
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
        },
      },
    });

    // 8. Prepare email content
    const companyName = brandName || sender.name || "RTAS";
    
    let emailHtml = html;
    let emailText = text;
    
    if (emailHtml) {
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
        emailText = `Your verification code is: ${otp}\n\nThis code will expire in ${expiry} minutes.`;
      }
    } else {
      emailHtml = getDefaultOTPTemplate(otp, companyName);
      emailText = text || getDefaultTextTemplate(otp, companyName);
    }

    const emailSubject = subject || `Your verification code for ${companyName}`;

    // 9. Send email
    const emailResult = await emailSender.sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      fromEmail: sender.email,
      fromName: sender.name,
      headers: {
        "X-OTP-ID": otpId,
        "X-Workspace-ID": keyInfo.workspaceId,
        "X-API-Key-ID": keyInfo.id,
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

      // Track failed API usage
      const today = getStartOfDay();
      
      await db.aPiUsageSummary.upsert({
        where: {
          workspaceId_date_service: {
            workspaceId: keyInfo.workspaceId,
            date: today,
            service: "otp_send",
          },
        },
        update: {
          totalCalls: { increment: 1 },
          failedCalls: { increment: 1 },
        },
        create: {
          id: dropid("aus"),
          workspaceId: keyInfo.workspaceId,
          apiKeyId: keyInfo.id,
          date: today,
          service: "otp_send",
          totalCalls: 1,
          successCalls: 0,
          failedCalls: 1,
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

    // 10. Update workspace OTP count
    await db.workspace.update({
      where: { id: keyInfo.workspaceId },
      data: {
        currentOtpSent: { increment: 1 },
      },
    });

    // 11. Track successful API usage
    const today = getStartOfDay();
    
    await db.aPiUsageSummary.upsert({
      where: {
        workspaceId_date_service: {
          workspaceId: keyInfo.workspaceId,
          date: today,
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
        date: today,
        service: "otp_send",
        totalCalls: 1,
        successCalls: 1,
        failedCalls: 0,
      },
    });

    // 12. Return success response
    const response = NextResponse.json(
      {
        success: true,
        data: {
          id: otpRecord.id,
          message: `OTP sent successfully to ${email}`,
          expiresAt: expiresAt.toISOString(),
          ...(process.env.NODE_ENV === "development" && { debug: { otp } }),
        },
      },
      { status: 200 }
    );
    
    return addCORSHeaders(response);
    
  } catch (error) {
    console.error("[V1_OTP_SEND_ERROR]", error);

    // Track failed API usage for unexpected errors
    try {
      const validation = await validateApiKey(req);
      if (validation.valid && validation.keyInfo) {
        const today = getStartOfDay();
        
        await db.aPiUsageSummary.upsert({
          where: {
            workspaceId_date_service: {
              workspaceId: validation.keyInfo.workspaceId,
              date: today,
              service: "otp_send",
            },
          },
          update: {
            totalCalls: { increment: 1 },
            failedCalls: { increment: 1 },
          },
          create: {
            id: dropid("aus"),
            workspaceId: validation.keyInfo.workspaceId,
            apiKeyId: validation.keyInfo.id,
            date: today,
            service: "otp_send",
            totalCalls: 1,
            successCalls: 0,
            failedCalls: 1,
          },
        });
      }
    } catch (summaryError) {
      console.error("[V1_OTP_SEND_SUMMARY_ERROR]", summaryError);
    }

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


