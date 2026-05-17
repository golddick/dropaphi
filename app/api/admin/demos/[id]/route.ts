// app/api/admin/demos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serverError } from "@/lib/respond/response";
import { requireAdmin } from "@/lib/auth/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle params as Promise (Next.js 15+)
    const { id } = await params;
    
    console.log("Updating demo with ID:", id);

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

    // Check if video exists
    const existing = await db.demoVideo.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Demo video not found", success: false },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (category !== undefined) updateData.category = category;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (duration !== undefined) updateData.duration = duration;
    if (tag !== undefined) updateData.tag = tag;
    if (tagColor !== undefined) updateData.tagColor = tagColor;
    if (src !== undefined) updateData.src = src;
    if (poster !== undefined) updateData.poster = poster;
    if (steps !== undefined) updateData.steps = JSON.stringify(steps);
    if (codeSnippet !== undefined) updateData.codeSnippet = codeSnippet;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    // Update video
    const updated = await db.demoVideo.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: { ...updated, steps: JSON.parse(updated.steps as string) },
    });
  } catch (error) {
    console.error("[ADMIN_DEMOS_PATCH]", error);
    return serverError();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle params as Promise (Next.js 15+)
    const { id } = await params;
    
    console.log("Deleting demo with ID:", id);

    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    // Check if video exists
    const video = await db.demoVideo.findUnique({
      where: { id },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Demo video not found", success: false },
        { status: 404 }
      );
    }

    // Delete from database
    await db.demoVideo.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Demo video deleted successfully",
    });
  } catch (error) {
    console.error("[ADMIN_DEMOS_DELETE]", error);
    return serverError();
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle params as Promise (Next.js 15+)
    const { id } = await params;
    
    console.log("Fetching demo with ID:", id);

    const auth = await requireAdmin();
    if (auth instanceof Response) return auth;

    const video = await db.demoVideo.findUnique({
      where: { id },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Demo video not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { ...video, steps: JSON.parse(video.steps as string) },
    });
  } catch (error) {
    console.error("[ADMIN_DEMOS_GET]", error);
    return serverError();
  }
}