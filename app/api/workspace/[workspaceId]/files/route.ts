import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth-server";
import { dropid } from "dropid";
import {
  ok,
  err,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  created,
} from "@/lib/respond/response";
import { uploadWorkspaceFile } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png", 
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  
  // Documents
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/json",
  "application/xml",
  "application/rtf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-word.document.macroEnabled.12",
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel.sheet.macroEnabled.12",
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
  
  // OpenOffice/LibreOffice formats
  "application/vnd.oasis.opendocument.text", // .odt
  "application/vnd.oasis.opendocument.spreadsheet", // .ods
  "application/vnd.oasis.opendocument.presentation", // .odp
  
  // Archives
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/x-tar",
  "application/gzip",
];

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function bytesToMB(bytes: number | bigint): number {
  const bytesNum = typeof bytes === 'bigint' ? Number(bytes) : bytes;
  // Round to 2 decimal places for accuracy
  return Math.round((bytesNum / (1024 * 1024)) * 100) / 100;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

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
      return forbidden("You don't have permission to upload files");
    }

    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        fileLimit: true,
        currentFilesUsed: true,
      },
    });

    if (!workspace) return notFound("Workspace not found");

    const formData = await req.formData();
    const file = formData.get("file") as File;

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

    // Calculate file size in MB (rounded to 2 decimal places)
    const fileSizeMB = bytesToMB(file.size);

    console.log(`File size: ${file.size} bytes = ${fileSizeMB} MB`);
    console.log(`Current usage: ${workspace.currentFilesUsed} MB`);
    console.log(`New total: ${workspace.currentFilesUsed + fileSizeMB} MB`);
    console.log(`Limit: ${workspace.fileLimit} MB`);

    // Check if adding this file would exceed the limit
    if (workspace.currentFilesUsed + fileSizeMB > workspace.fileLimit) {
      return err(
        "Workspace storage limit exceeded",
        403,
        "STORAGE_LIMIT"
      );
    }

    const safeName = sanitizeFileName(file.name);

    const fileId = dropid("fil");

    const uploadResult = await uploadWorkspaceFile(workspaceId, file);

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const cdnUrl = `${baseUrl}/api/files/${uploadResult.path}`;

    // Create file record and update workspace in a transaction to ensure consistency
    const result = await db.$transaction(async (tx) => {
      // Create file record
      const fileRecord = await tx.file.create({
        data: {
          id: fileId,
          workspaceId,
          name: safeName,
          originalName: file.name,
          mimeType: file.type,
          size: fileSizeMB,
          storageKey: uploadResult.path,
          cdnUrl,
          directUrl: uploadResult.url,
          uploadedBy: auth.userId,
          visibility: "PUBLIC",
          metadata: {
            uploadedFrom: "dashboard",
            sizeInMB: fileSizeMB,
          },
        },
      });

      // Update workspace currentFilesUsed (stored in MB)
      await tx.workspace.update({
        where: { id: workspaceId },
        data: {
          currentFilesUsed: {
            increment: fileSizeMB,
          },
        },
      });

      return fileRecord;
    });

    // Create usage log (fire and forget - don't await)
    db.usageLog.create({
      data: {
        id: dropid("ulg"),
        workspaceId,
        service: "file_storage",
        month: new Date().toISOString().slice(0, 7),
        currentFilesUsed: workspace.currentFilesUsed + fileSizeMB, // Store the new total
        currentEmailsSent: 0,
        currentSmsSent: 0,
        currentOtpSent: 0,
        currentSubscribers: 0,
        metadata: {
          fileId,
          mimeType: file.type,
          size: file.size,
          sizeInMB: fileSizeMB,
          action: 'upload',
        },
      },
    }).catch(err => console.error('Failed to create usage log:', err));

    // Fetch updated workspace to verify the increment
    const updatedWorkspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { currentFilesUsed: true }
    });

    console.log(`Updated workspace currentFilesUsed: ${updatedWorkspace?.currentFilesUsed} MB`);

    return created({
      file: {
        id: result.id,
        name: result.name,
        originalName: result.originalName,
        size: Number(result.size),
        sizeInMB: fileSizeMB,
        mimeType: result.mimeType,
        cdnUrl: result.cdnUrl,
        directUrl: result.directUrl,
        createdAt: result.createdAt,
      },
      workspace: {
        currentFilesUsed: updatedWorkspace?.currentFilesUsed,
        fileLimit: workspace.fileLimit,
        remaining: workspace.fileLimit - (updatedWorkspace?.currentFilesUsed || 0),
      },
    });
  } catch (error) {
    console.error("[FILE_UPLOAD_ERROR]", error);
    return serverError(
      error instanceof Error ? error.message : "Upload failed"
    );
  }
}

// GET endpoint (unchanged)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    });

    if (!member) return unauthorized();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 50);

    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      db.file.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      db.file.count({
        where: { workspaceId },
      }),
    ]);

    return ok({
      files: files.map((file) => ({
        ...file,
        size: Number(file.size),
        sizeInMB: bytesToMB(file.size),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[FILES_GET_ERROR]", error);
    return serverError();
  }
}

// DELETE endpoint
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

    const auth = await requireAuth();
    if (auth instanceof Response) return auth;

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: auth.userId,
      },
    });

    if (!member) return unauthorized();

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");

    if (!fileId) {
      return err("File ID required", 400, "MISSING_ID");
    }

    const file = await db.file.findFirst({
      where: {
        id: fileId,
        workspaceId,
      },
    });

    if (!file) return notFound("File not found");

    // Calculate file size in MB
    const fileSizeMB = bytesToMB(file.size);

    // Delete from storage and database in transaction
    await db.$transaction(async (tx) => {
      // Delete from Supabase storage
      const { supabaseAdmin } = await import("@/lib/supabase/admin");
      await supabaseAdmin.storage
        .from("workspace-files")
        .remove([file.storageKey]);

      // Update workspace currentFilesUsed (decrement)
      await tx.workspace.update({
        where: { id: workspaceId },
        data: {
          currentFilesUsed: {
            decrement: fileSizeMB,
          },
        },
      });

      // Delete file record
      await tx.file.delete({
        where: { id: fileId },
      });
    });

    // Create usage log for deletion
    db.usageLog.create({
      data: {
        id: dropid("ulg"),
        workspaceId,
        service: "file_storage",
        month: new Date().toISOString().slice(0, 7),
        currentFilesUsed: 0, // We don't know the new total here without another query
        currentEmailsSent: 0,
        currentSmsSent: 0,
        currentOtpSent: 0,
        currentSubscribers: 0,
        metadata: {
          fileId,
          action: 'delete',
          sizeInMB: fileSizeMB,
        },
      },
    }).catch(err => console.error('Failed to create usage log:', err));

    return ok({
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("[FILE_DELETE_ERROR]", error);
    return serverError();
  }
}



