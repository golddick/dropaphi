// app/api/v1/otp/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { z } from "zod";
import { validateApiKey } from "@/lib/api-key/validate";
import { verifyOTP } from "@/lib/v1-api/otp/utils";
import { handleCORS, addCORSHeaders } from "@/lib/cors";

// Validation schema for verify OTP request
const verifyOTPSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Invalid email address"),
  code: z.string().min(4).max(8),
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
    const parsed = verifyOTPSchema.safeParse(body);

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

    const { id, email, code } = parsed.data;

    // 3. Find the OTP request
    const whereClause: any = {
      workspaceId: keyInfo.workspaceId,
      recipient: email,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    };

    if (id) {
      whereClause.id = id;
    }

    const otpRequest = await db.otpRequest.findFirst({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    if (!otpRequest) {
      const response = NextResponse.json(
        {
          success: false,
          error: "No valid OTP found for this email",
        },
        { status: 404 }
      );
      return addCORSHeaders(response);
    }

    // 4. Check attempts
    if (otpRequest.attempts >= otpRequest.maxAttempts) {
      await db.otpRequest.update({
        where: { id: otpRequest.id },
        data: { status: "FAILED" },
      });

      const response = NextResponse.json(
        {
          success: false,
          error: "Maximum verification attempts exceeded",
          attemptsRemaining: 0,
        },
        { status: 429 }
      );
      return addCORSHeaders(response);
    }

    // 5. Verify OTP (using our new verify function that compares with decrypted OTP)
    const isValid = verifyOTP(code, otpRequest.otpEncrypted);

    // 6. Update attempts
    const updatedRequest = await db.otpRequest.update({
      where: { id: otpRequest.id },
      data: {
        attempts: { increment: 1 },
      },
    });

    if (!isValid) {
      const attemptsRemaining = otpRequest.maxAttempts - (updatedRequest.attempts);
      
      const response = NextResponse.json(
        {
          success: false,
          error: "Invalid OTP code",
          attemptsRemaining,
        },
        { status: 400 }
      );
      return addCORSHeaders(response);
    }

    // 7. Mark as verified
    await db.otpRequest.update({
      where: { id: otpRequest.id },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
      },
    });

    // 8. Log API usage
    await db.aPiUsageSummary.upsert({
      where: {
        workspaceId_date_service: {
          workspaceId: keyInfo.workspaceId,
          date: new Date(),
          service: "otp_verify",
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
        service: "otp_verify",
        totalCalls: 1,
        successCalls: 1,
        failedCalls: 0,
      },
    });

    // 9. Return success response
    const response = NextResponse.json(
      {
        success: true,
        data: {
          verified: true,
          message: "OTP verified successfully",
          id: otpRequest.id,
          verifiedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
    
    return addCORSHeaders(response);
    
  } catch (error) {
    console.error("[V1_OTP_VERIFY_ERROR]", error);
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