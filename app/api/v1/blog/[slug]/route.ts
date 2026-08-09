import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key/validate";
import { handleCORS, addCORSHeaders } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return handleCORS(req);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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

    const { slug } = await params;
    const { keyInfo } = validation;

    if (!keyInfo) {
      return addCORSHeaders(
        NextResponse.json(
          { success: false, error: "Invalid API key information" },
          { status: 401 }
        )
      );
    }

    const post = await db.blogPost.findFirst({
      where: {
        slug,
        workspaceId: keyInfo.workspaceId,
        status: "PUBLISHED",
      },
      include: {
        author: {
          select: {
            fullName: true,
            avatarUrl: true,
            bio: true,
          },
        },
        workspace: {
          select: {
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!post) {
      return addCORSHeaders(
        NextResponse.json(
          { success: false, error: "Blog post not found" },
          { status: 404 }
        )
      );
    }

    await db.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return addCORSHeaders(
      NextResponse.json({
        success: true,
        data: post,
      })
    );
  } catch (error) {
    console.error("[V1_BLOG_GET_ERROR]", error);
    return addCORSHeaders(
      NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      )
    );
  }
}
