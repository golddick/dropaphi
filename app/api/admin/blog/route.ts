import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { ok, unauthorized, forbidden, serverError } from "@/lib/respond/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    // Check if user is platform admin/owner
    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    });

    if (!user || !["OWNER", "ADMIN"].includes(user.role)) {
      return forbidden("Insufficient permissions to access admin blog management");
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const isApproved = searchParams.get("isApproved");
    const isFeatured = searchParams.get("isFeatured");
    const search = searchParams.get("search");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (isApproved !== null && isApproved !== undefined) where.isApproved = isApproved === "true";
    if (isFeatured !== null && isFeatured !== undefined) where.isFeatured = isFeatured === "true";
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { workspace: { name: { contains: search, mode: 'insensitive' } } },
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
            select: { fullName: true, email: true, avatarUrl: true }
          },
          workspace: {
            select: { name: true, slug: true }
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
    console.error("[ADMIN_BLOG_LIST_ERROR]", error);
    return serverError();
  }
}
