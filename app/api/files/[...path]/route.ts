import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;

    if (!path || path.length < 2) {
      return new NextResponse("Invalid file path", { status: 400 });
    }

    const storageKey = path.join("/");
    const workspaceId = path[0];

    const file = await db.file.findFirst({
      where: {
        workspaceId,
        storageKey,
      },
      select: {
        mimeType: true,
        size: true,
      },
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    const { data, error } = await supabaseAdmin.storage
      .from("workspace-files")
      .download(storageKey);

    if (error || !data) {
      console.error("[SUPABASE_DOWNLOAD_ERROR]", error);
      return new NextResponse("File not found", { status: 404 });
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Length": file.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("[FILE_SERVE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}