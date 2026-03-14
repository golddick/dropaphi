import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key/validate";

export async function GET(req: NextRequest) {
  try {
    // Validate API key
    const validation = await validateApiKey(req);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: validation.status || 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const folder = searchParams.get("folder");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      workspaceId: validation.keyInfo?.workspaceId,
    };

    if (folder) {
      where.metadata = {
        path: ["folder"],
        equals: folder,
      };
    }

    // Get files
    const [files, total] = await Promise.all([
      db.file.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        select: {
          id: true,
          originalName: true,
          name: true,
          mimeType: true,
          size: true,
          cdnUrl: true,
          visibility: true,
          createdAt: true,
          metadata: true,
        },
      }),
      db.file.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        files: files.map(f => ({
          ...f,
          size: Number(f.size),
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    console.error("[V1_LIST_FILES_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}