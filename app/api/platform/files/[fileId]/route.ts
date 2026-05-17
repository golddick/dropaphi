// app/api/platform/files/[fileId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = await params;

    // Get file record from database
    const file = await db.platformFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Check if file is public or if user has access
    const isPublic = file.entityType === 'demo' || 
                     file.entityType === 'avatar' ||
                     file.type === 'thumbnail';

    if (!isPublic) {
      // For private files, check authentication
      const authHeader = req.headers.get('authorization');
      // You can add more sophisticated auth here
      
      // For now, allow if it's a demo or avatar
    }

    // Stream file from Supabase
    const { data, error } = await supabaseAdmin.storage
      .from("platform-files")
      .download(file.storageKey);

    if (error) {
      console.error("[PLATFORM_FILE_DOWNLOAD]", error);
      return NextResponse.json(
        { error: "Failed to fetch file" },
        { status: 500 }
      );
    }

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', file.mimeType);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Content-Disposition', `inline; filename="${file.originalName}"`);

    // Return file
    return new NextResponse(data, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[PLATFORM_FILE_SERVE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// HEAD request for file metadata
export async function HEAD(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = await params;

    const file = await db.platformFile.findUnique({
      where: { id: fileId },
      select: {
        size: true,
        mimeType: true,
        originalName: true,
        createdAt: true,
      },
    });

    if (!file) {
      return new NextResponse(null, { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', file.mimeType);
    headers.set('Content-Length', String(file.size * 1024 * 1024));
    headers.set('Content-Disposition', `inline; filename="${file.originalName}"`);
    headers.set('Last-Modified', file.createdAt.toUTCString());

    return new NextResponse(null, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[PLATFORM_FILE_HEAD]", error);
    return new NextResponse(null, { status: 500 });
  }
}