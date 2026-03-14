import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key/validate";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // Validate API key
    const validation = await validateApiKey(req);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: validation.status || 401 }
      );
    }

    const { fileId } = await params;

    // Find file
    const file = await db.file.findFirst({
      where: {
        id: fileId,
        workspaceId: validation.keyInfo?.workspaceId,
      },
      select: {
        id: true,
        originalName: true,
        name: true,
        mimeType: true,
        size: true,
        cdnUrl: true,
        directUrl: true,
        visibility: true,
        width: true,
        height: true,
        duration: true,
        metadata: true,
        createdAt: true,
      },
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...file,
        size: Number(file.size),
      },
    });

  } catch (error) {
    console.error("[V1_FILE_INFO_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // Validate API key
    const validation = await validateApiKey(req);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: validation.status || 401 }
      );
    }

    const { fileId } = await params;

    // Find file
    const file = await db.file.findFirst({
      where: {
        id: fileId,
        workspaceId: validation.keyInfo?.workspaceId,
      },
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    // Delete from Supabase storage
    const { error: deleteError } = await supabaseAdmin.storage
      .from("workspace-files")
      .remove([file.storageKey]);

    if (deleteError) {
      console.error("[V1_DELETE_STORAGE_ERROR]", deleteError);
    }

    // Update workspace usage
    const fileSizeMB = Number(file.size) / (1024 * 1024);
    await db.workspace.update({
      where: { id: validation.keyInfo!.workspaceId },
      data: {
        currentFilesUsed: {
          decrement: fileSizeMB,
        },
      },
    });

    // Delete from database
    await db.file.delete({
      where: { id: fileId },
    });

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });

  } catch (error) {
    console.error("[V1_DELETE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}