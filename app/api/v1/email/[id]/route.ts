import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { validateApiKey } from "@/lib/api-key/validate";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Validate API key
    const validation = await validateApiKey(req);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: validation.status || 401 }
      );
    }

    const { id } = await params;

    // 2. Find email record
    const email = await db.email.findFirst({
      where: {
        id,
        workspaceId: validation.keyInfo?.workspaceId,
      },
      select: {
        id: true,
        fromEmail: true,
        fromName: true,
        toEmails: true,
        subject: true,
        status: true,
        providerRef: true,
        deliveredAt: true,
        openedAt: true,
        clickedAt: true,
        bouncedAt: true,
        bounceReason: true,
        openCount: true,
        clickCount: true,
        createdAt: true,
        metadata: true,
        _count: {
          select: {
            trackingEvents: true,
          },
        },
      },
    });

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email not found" },
        { status: 404 }
      );
    }

    // 3. Log API usage
    await db.aPiUsageSummary.upsert({
      where: {
        workspaceId_date_service: {
          workspaceId: validation.keyInfo!.workspaceId,
          date: new Date(),
          service: "email_status",
        },
      },
      update: {
        totalCalls: { increment: 1 },
        successCalls: { increment: 1 },
      },
      create: {
        id: dropid("aus"),
        workspaceId: validation.keyInfo!.workspaceId,
        apiKeyId: validation.keyInfo!.id,
        date: new Date(),
        service: "email_status",
        totalCalls: 1,
        successCalls: 1,
        failedCalls: 0,
      },
    });

    // 4. Return response
    return NextResponse.json({
      success: true,
      data: {
        ...email,
        toEmails: email.toEmails.length,
      },
    });
  } catch (error) {
    console.error("[V1_EMAIL_STATUS_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}