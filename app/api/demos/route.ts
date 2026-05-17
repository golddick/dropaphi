// app/api/demos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, serverError } from "@/lib/respond/response";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const featured = searchParams.get("featured") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const demoId = searchParams.get("id");

    // If specific demo requested
    if (demoId) {
      const demo = await db.demoVideo.findUnique({
        where: { id: demoId, isPublished: true },
      });

      if (!demo) {
        return NextResponse.json(
          { error: "Demo not found", success: false },
          { status: 404 }
        );
      }

      return ok({
        ...demo,
        steps: Array.isArray(demo.steps) ? demo.steps : JSON.parse(demo.steps as string || "[]"),
      });
    }

    // Build where clause for listing
    const where: any = {
      isPublished: true,
    };

    if (category && category !== "All") {
      where.category = category;
    }

    if (featured) {
      where.isFeatured = true;
    }

    const demos = await db.demoVideo.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
    });

    const transformedDemos = demos.map(demo => ({
      ...demo,
      steps: Array.isArray(demo.steps) ? demo.steps : JSON.parse(demo.steps as string || "[]"),
    }));

    return ok({
      demos: transformedDemos,
      total: transformedDemos.length,
    });
  } catch (error) {
    console.error("[DEMOS_PUBLIC_GET]", error);
    return serverError();
  }
}