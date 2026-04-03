// app/api/files/[fileId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    if (!fileId) {
      return new NextResponse("File ID is required", { status: 400 });
    }

    // Find the file in database
    const file = await db.file.findFirst({
      where: {
        id: fileId,
      },
      select: {
        workspaceId: true,
        storageKey: true,
        mimeType: true,
        size: true,
        name: true,
        originalName: true,
      },
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Download from Supabase using storageKey
    const { data, error } = await supabaseAdmin.storage
      .from("workspace-files")
      .download(file.storageKey);

    if (error || !data) {
      console.error("[SUPABASE_DOWNLOAD_ERROR]", error);
      return new NextResponse("File not found", { status: 404 });
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    // Determine if file should be displayed inline or downloaded
    const isImage = file.mimeType?.startsWith("image/");
    const isPdf = file.mimeType === "application/pdf";
    const isInline = isImage || isPdf;
    
    // Use original name for download, or fallback to stored name
    const displayName = file.originalName || file.name;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Length": file.size?.toString() || "0",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": isInline 
          ? "inline" 
          : `attachment; filename="${encodeURIComponent(displayName)}"`,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("[FILE_SERVE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}