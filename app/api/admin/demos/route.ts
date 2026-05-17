// app/api/admin/demos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { dropid } from "dropid";
import { ok, serverError, created } from "@/lib/respond/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { tag: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "All") {
      where.category = category;
    }

    // Get total count
    const total = await db.demoVideo.count({ where });

    // Get videos
    const videos = await db.demoVideo.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    // Transform steps from JSON to array
    const transformedVideos = videos.map(video => ({
      ...video,
      steps: Array.isArray(video.steps) ? video.steps : JSON.parse(video.steps as string || "[]"),
    }));

    return ok({
      videos: transformedVideos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[ADMIN_DEMOS_GET]", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const {
      category,
      title,
      description,
      duration,
      tag,
      tagColor,
      src,
      poster,
      steps,
      codeSnippet,
      isPublished,
      isFeatured,
      sortOrder,
    } = body;

    // Validate required fields
    if (!title || !src || !poster || !steps || steps.length < 2) {
      return NextResponse.json(
        { error: "Missing required fields or insufficient steps", success: false },
        { status: 400 }
      );
    }

    // Create demo video
    const video = await db.demoVideo.create({
      data: {
        id: dropid("dem"),
        category,
        title,
        description: description || "",
        duration: duration || "0:00",
        tag,
        tagColor,
        src,
        poster,
        steps: JSON.stringify(steps),
        codeSnippet: codeSnippet || "",
        isPublished: isPublished || false,
        isFeatured: isFeatured || false,
        sortOrder: sortOrder || 0,
      },
    });

    return created({
      success: true,
      data: { ...video, steps: JSON.parse(video.steps as string) },
    });
  } catch (error) {
    console.error("[ADMIN_DEMOS_POST]", error);
    return serverError();
  }
}