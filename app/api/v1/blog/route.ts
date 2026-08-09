import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key/validate";
import { handleCORS, addCORSHeaders } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return handleCORS(req);
}

export async function GET(req: NextRequest) {
  try {
    const validation = await validateApiKey(req);
    if (!validation.valid) {
      return addCORSHeaders(
        NextResponse.json(
          { success: false, error: validation.error },
          { status: validation.status || 401 }
        )
      );
    }

    const { keyInfo } = validation;
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "10", 10), 1), 50);
    const skip = (page - 1) * limit;
    const tag = searchParams.get("tag");
    const isFeatured = searchParams.get("isFeatured");
    const search = searchParams.get("search");

    const where: any = {
      workspaceId: keyInfo.workspaceId,
      status: "PUBLISHED",
    };

    if (tag) {
      where.tags = { has: tag };
    }

    if (isFeatured !== null && isFeatured !== undefined) {
      where.isFeatured = isFeatured === "true";
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [posts, total] = await Promise.all([
      db.blogPost.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: limit,
        skip,
        include: {
          author: {
            select: {
              fullName: true,
              avatarUrl: true,
            },
          },
          workspace: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
      db.blogPost.count({ where }),
    ]);

    return addCORSHeaders(
      NextResponse.json({
        success: true,
        data: {
          posts,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      })
    );
  } catch (error) {
    console.error("[V1_BLOG_LIST_ERROR]", error);
    return addCORSHeaders(
      NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      )
    );
  }
}
