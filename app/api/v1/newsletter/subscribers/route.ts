import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key/validate";
import { handleCORS, addCORSHeaders } from "@/lib/cors";

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return handleCORS(req);
}

/**
 * GET /v1/newsletter/subscribers
 * List all subscribers for the workspace with pagination
 */
export async function GET(req: NextRequest) {
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

    const workspaceId = validation.keyInfo?.workspaceId;
    if (!workspaceId) {
      return addCORSHeaders(NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 }
      ));
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status"); // ACTIVE, UNSUBSCRIBED, etc.
    const segment = searchParams.get("segment");
    
    const skip = (page - 1) * limit;

    // 3. Build where clause
    const where: any = {
      workspaceId,
    };

    if (status) {
      where.status = status;
    }

    if (segment) {
      where.segments = {
        has: segment,
      };
    }

    // 4. Fetch subscribers and total count
    const [subscribers, total] = await Promise.all([
      db.subscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: Math.min(limit, 100), // Cap limit at 100
        skip,
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          segments: true,
          customFields: true,
          confirmedAt: true,
          unsubscribedAt: true,
          source: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.subscriber.count({ where }),
    ]);

    // 5. Return response
    const response = NextResponse.json({
      success: true,
      data: {
        subscribers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
    
    return addCORSHeaders(response);

  } catch (error) {
    console.error("[V1_LIST_SUBSCRIBERS_ERROR]", error);
    const response = NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
    return addCORSHeaders(response);
  }
}
