import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { z } from "zod";
import { dropid } from "dropid";
import {
  ok,
  err,
  unauthorized,
  forbidden,
  notFound,
  validationError,
  serverError,
  created,
} from "@/lib/respond/response";
import { BillingService } from "@/lib/billing/billing-service";
import { Services } from "@/lib/generated/prisma";
import { checkServiceStatus } from "@/lib/services/service-status";
import { blogNotification } from "@/lib/email/service/blog-notification.service";

const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

    const blogActive = await checkServiceStatus(Services.BLOG);
    if (!blogActive) {
      return err("Blog service is not available", 403, "SERVICE_UNAVAILABLE");
    }


    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    });

    if (!member) return unauthorized();
    if (!["OWNER", "ADMIN", "WRITER"].includes(member.role)) {
      return forbidden("Insufficient permissions to create blog posts");
    }

    const body = await req.json();
    const parsed = blogPostSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const data = parsed.data;

    // Check limits if trying to publish or create
    // We check BLOG limit here
    const limitCheck = await BillingService.checkLimit(workspaceId, Services.BLOG);
    if (!limitCheck.success) {
      return err("Blog post limit reached", 403, "LIMIT_EXCEEDED");
    }

    const postId = dropid("post");

    const post = await db.blogPost.create({
      data: {
        id: postId,
        workspaceId,
        authorId: auth.userId,
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        tags: data.tags,
        status: data.status,
        isFeatured: data.isFeatured,
        isApproved: false, // Always false on creation for non-admins
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    // If published, deduct credits and notify subscribers
    if (data.status === "PUBLISHED") {
      await BillingService.deductCredits(workspaceId, Services.BLOG);
      await blogNotification.notifySubscribers({ workspaceId, postId });
    }

    return created(post);
  } catch (error) {
    console.error("[BLOG_CREATE_ERROR]", error);
    return serverError(error instanceof Error ? error.message : "Unknown error");
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const skip = (page - 1) * limit;

    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const member = await db.workspaceMember.findFirst({
      where: { workspaceId, userId: auth.userId },
    });
    if (!member) return unauthorized();

    const where: any = { workspaceId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      db.blogPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          author: {
            select: { fullName: true, avatarUrl: true }
          }
        }
      }),
      db.blogPost.count({ where }),
    ]);

    return ok({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[BLOG_LIST_ERROR]", error);
    return serverError();
  }
}
