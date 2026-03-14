import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { z } from "zod";
import { validateApiKey } from "@/lib/api-key/validate";
import { verifyOTP } from "@/lib/v1-api/otp/utils";


// Validation schema for verify OTP request
const verifyOTPSchema = z.object({
  id: z.string().optional(), // OTP request ID (optional)
  email: z.string().email("Invalid email address"),
  code: z.string().min(4).max(8),
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

    // 2. Parse and validate request body
    const body = await req.json();
    const parsed = verifyOTPSchema.safeParse(body);

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

    const { id, email, code } = parsed.data;

    // 3. Find the OTP request
    const whereClause: any = {
      workspaceId: keyInfo!.workspaceId,
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
      return NextResponse.json(
        {
          success: false,
          error: "No valid OTP found for this email",
        },
        { status: 404 }
      );
    }

    // 4. Check attempts
    if (otpRequest.attempts >= otpRequest.maxAttempts) {
      await db.otpRequest.update({
        where: { id: otpRequest.id },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        {
          success: false,
          error: "Maximum verification attempts exceeded",
        },
        { status: 429 }
      );
    }

    // 5. Verify OTP
    const isValid = await verifyOTP(code, otpRequest.otpHash);

    // 6. Update attempts
    await db.otpRequest.update({
      where: { id: otpRequest.id },
      data: {
        attempts: { increment: 1 },
      },
    });

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid OTP code",
          attemptsRemaining: otpRequest.maxAttempts - (otpRequest.attempts + 1),
        },
        { status: 400 }
      );
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
          workspaceId: keyInfo!.workspaceId,
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
        workspaceId: keyInfo!.workspaceId,
        apiKeyId: keyInfo!.id,
        date: new Date(),
        service: "otp_verify",
        totalCalls: 1,
        successCalls: 1,
        failedCalls: 0,
      },
    });

    // 9. Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          verified: true,
          message: "OTP verified successfully",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[V1_OTP_VERIFY_ERROR]", error);
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