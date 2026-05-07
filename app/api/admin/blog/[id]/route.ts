import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { ok, notFound, serverError, validationError } from "@/lib/respond/response";
import { z } from "zod";

const updateSchema = z.object({
  isApproved: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    
    if (!parsed.success) return validationError(parsed.error);

    const post = await db.blogPost.findUnique({
      where: { id },
    });

    if (!post) return notFound("Blog post not found");

    const updatedPost = await db.blogPost.update({
      where: { id },
      data: parsed.data,
    });

    return ok(updatedPost);
  } catch (error) {
    console.error("[ADMIN_BLOG_PATCH_ERROR]", error);
    return serverError();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const { id } = await params;

    const post = await db.blogPost.findUnique({
      where: { id },
    });

    if (!post) return notFound("Blog post not found");

    await db.blogPost.delete({
      where: { id },
    });

    return ok({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("[ADMIN_BLOG_DELETE_ERROR]", error);
    return serverError();
  }
}
