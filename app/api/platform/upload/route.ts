// app/api/platform/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { dropid } from "dropid";
import { ok, err, unauthorized, serverError, created } from "@/lib/respond/response";
import { uploadPlatformFile } from "@/lib/supabase/platform-storage";
import { Services } from "@/lib/generated/prisma";
import { checkServiceStatus } from "@/lib/services/service-status";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for platform uploads

const ALLOWED_MIME_TYPES = [
  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  
  // Images
  "image/jpeg",
  "image/png", 
  "image/webp",
  "image/gif",
  "image/svg+xml",
  
  // Documents
  "application/pdf",
  "text/plain",
  "application/json",
];

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function bytesToMB(bytes: number | bigint): number {
  const bytesNum = typeof bytes === 'bigint' ? Number(bytes) : bytes;
  return Math.round((bytesNum / (1024 * 1024)) * 100) / 100;
}

export async function POST(req: NextRequest) {
  try {
    // Check if storage service is active
    const serviceStatusError = await checkServiceStatus(Services.STORAGE);
    if (serviceStatusError) return serviceStatusError;

    // Require authentication
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "general"; // video, thumbnail, avatar, document, etc.
    const entityType = formData.get("entityType") as string || "demo"; // demo, avatar, blog, etc.
    const entityId = formData.get("entityId") as string || null;

    if (!file) {
      return err("No file uploaded", 400, "NO_FILE");
    }

    if (file.size > MAX_FILE_SIZE) {
      return err(
        "File too large",
        400,
        "FILE_TOO_LARGE",
        `Max file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return err(
        "Invalid file type",
        400,
        "INVALID_FILE_TYPE"
      );
    }

    const safeName = sanitizeFileName(file.name);
    const fileId = dropid("puf"); // platform upload file

    // Upload to Supabase platform bucket
    const uploadResult = await uploadPlatformFile(type, file, entityType, entityId);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const cdnUrl = `${baseUrl}/api/platform/files/${fileId}`;

    // Create platform file record
    const fileRecord = await db.platformFile.create({
      data: {
        id: fileId,
        userId: auth.userId,
        type: type,
        entityType: entityType,
        entityId: entityId,
        name: safeName,
        originalName: file.name,
        mimeType: file.type,
        size: bytesToMB(file.size),
        storageKey: uploadResult.path,
        cdnUrl: cdnUrl,
        directUrl: uploadResult.url,
        metadata: {
          uploadedFrom: "platform",
          sizeInMB: bytesToMB(file.size),
          entityType: entityType,
        },
      },
    });


    return created({
      file: {
        id: fileRecord.id,
        name: fileRecord.name,
        originalName: fileRecord.originalName,
        size: Number(fileRecord.size),
        sizeInMB: bytesToMB(file.size),
        mimeType: fileRecord.mimeType,
        cdnUrl: fileRecord.cdnUrl,
        directUrl: fileRecord.directUrl,
        type: fileRecord.type,
        createdAt: fileRecord.createdAt,
      },
    });
  } catch (error) {
    console.error("[PLATFORM_UPLOAD_ERROR]", error);
    return serverError(
      error instanceof Error ? error.message : "Upload failed"
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");

    if (!fileId) {
      return err("File ID required", 400, "MISSING_ID");
    }

    const file = await db.platformFile.findFirst({
      where: {
        id: fileId,
        userId: auth.userId,
      },
    });

    if (!file) {
      return err("File not found", 404, "FILE_NOT_FOUND");
    }

    // Delete from Supabase storage
    const { supabaseAdmin } = await import("@/lib/supabase/admin");
    await supabaseAdmin.storage
      .from("platform-files")
      .remove([file.storageKey]);

    // Delete file record
    await db.platformFile.delete({
      where: { id: fileId },
    });

    
    return ok({
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("[PLATFORM_DELETE_ERROR]", error);
    return serverError();
  }
}