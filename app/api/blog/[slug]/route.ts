import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, notFound, serverError } from "@/lib/respond/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await db.blogPost.findFirst({
      where: {
        slug,
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
            logoUrl: true,
          },
        },
      },
    });

    if (!post) {
      return notFound("Blog post not found");
    }

    // Increment view count asynchronously
    db.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    }).catch(console.error);

    return ok(post);
  } catch (error) {
    console.error("[PUBLIC_BLOG_GET_ERROR]", error);
    return serverError();
  }
}
