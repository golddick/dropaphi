import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateApiKey } from "@/lib/api-key/validate";
import { z } from "zod";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
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

// Validation schema for upload metadata
const uploadMetadataSchema = z.object({
  folder: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  filename: z.string().optional(), // Custom filename (optional)
});

// Helper function to sanitize filename
function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_');
}

// Helper function to generate unique filename
function generateUniqueFileName(originalName: string, customName?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  if (customName) {
    const sanitized = sanitizeFileName(customName);
    const ext = originalName.split('.').pop();
    return `${timestamp}-${random}-${sanitized}.${ext}`;
  }
  
  const sanitized = sanitizeFileName(originalName);
  return `${timestamp}-${random}-${sanitized}`;
}

function bytesToMB(bytes: number | bigint): number {
  const bytesNum = typeof bytes === 'bigint' ? Number(bytes) : bytes;
  // Round to 2 decimal places for accuracy
  return Math.round((bytesNum / (1024 * 1024)) * 100) / 100;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Validate API key
    const validation = await validateApiKey(req);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false,
          error: validation.error 
        },
        { status: validation.status || 401 }
      );
    }

    const { keyInfo } = validation;
    if (!keyInfo) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid API key information" 
        },
        { status: 401 }
      );
    }

    // 2. Check if test key can upload (optional - you might want to restrict test keys)
    if (keyInfo.isTest) {
      console.log(`Test key ${keyInfo.id} used for upload`);
    }

    // 3. Get workspace with limits
    const workspace = await db.workspace.findUnique({
      where: { id: keyInfo.workspaceId },
      select: {
        fileLimit: true,
        currentFilesUsed: true,
        name: true,
      }
    });

    if (!workspace) {
      return NextResponse.json(
        { 
          success: false,
          error: "Workspace not found" 
        },
        { status: 404 }
      );
    }

    // 4. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const metadataStr = formData.get("metadata") as string | null;

    if (!file) {
      return NextResponse.json(
        { 
          success: false,
          error: "No file uploaded. Please provide a file in the 'file' field." 
        },
        { status: 400 }
      );
    }

    // 5. Parse metadata if provided
    let metadata = {};
    if (metadataStr) {
      try {
        const parsed = JSON.parse(metadataStr);
        const validated = uploadMetadataSchema.parse(parsed);
        metadata = validated;
      } catch (error) {
        return NextResponse.json(
          { 
            success: false,
            error: "Invalid metadata format. Please provide valid JSON.",
            details: error instanceof Error ? error.message : "Parse error"
          },
          { status: 400 }
        );
      }
    }

    // 6. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false,
          error: "File too large",
          maxSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
          yourSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
        },
        { status: 400 }
      );
    }

    // 7. Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false,
          error: "File type not allowed",
          allowedTypes: ALLOWED_MIME_TYPES,
          yourType: file.type
        },
        { status: 400 }
      );
    }
 
    // 8. Check file limit
   const fileSizeMB = bytesToMB(file.size);
    if (workspace.currentFilesUsed + fileSizeMB > workspace.fileLimit) {
      return NextResponse.json(
        {
          success: false,
          error: "Storage limit exceeded",
          used: `${workspace.currentFilesUsed.toFixed(2)}MB`,
          limit: `${workspace.fileLimit}MB`,
          needed: `${(workspace.currentFilesUsed + fileSizeMB).toFixed(2)}MB`
        },
        { status: 403 }
      );
    }

    // 9. Generate file info
    const fileId = dropid("fil");
    const originalFileName = file.name;
    const customFileName = (metadata as any).filename;
    const uniqueFileName = generateUniqueFileName(originalFileName, customFileName);
    const storageKey = `${keyInfo.workspaceId}/${uniqueFileName}`;

    // 10. Convert to buffer and upload to Supabase
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("workspace-files")
      .upload(storageKey, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("[V1_UPLOAD_ERROR]", uploadError);
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to upload file to storage: " + uploadError.message 
        },
        { status: 500 }
      );
    }

    // 11. Get public URL from Supabase
    const { data: urlData } = supabaseAdmin.storage
      .from("workspace-files")
      .getPublicUrl(storageKey);

    // 12. Generate API URL for the file
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://api.dropapi.com';
    const fileUrl = `${baseUrl}/v1/files/${keyInfo.workspaceId}/${uniqueFileName}`;

    // 13. Create file record in database
    const fileRecord = await db.file.create({
      data: {
        id: fileId,
        workspaceId: keyInfo.workspaceId,
        name: uniqueFileName,
        originalName: originalFileName,
        mimeType: file.type,
        size: fileSizeMB,
        storageKey,
        cdnUrl: fileUrl,
        directUrl: urlData.publicUrl,
        visibility: (metadata as any).visibility || 'PUBLIC',
        metadata: {
          uploadedFrom: "api_v1",
          apiKeyId: keyInfo.id,
          apiKeyName: keyInfo.name,
          isTestKey: keyInfo.isTest,
          originalSize: file.size,
          folder: (metadata as any).folder,
          tags: (metadata as any).tags,
          description: (metadata as any).description,
        },
      },
    });

    // 14. Update workspace usage
    await db.workspace.update({
      where: { id: keyInfo.workspaceId },
      data: {
        currentFilesUsed: {
          increment: fileSizeMB,
        },
      },
    });

    // 15. Log API usage
    await db.aPiUsageSummary.upsert({
      where: {
        workspaceId_date_service: {
          workspaceId: keyInfo.workspaceId,
          date: new Date(),
          service: "file_upload",
        }
      },
      update: {
        totalCalls: { increment: 1 },
        successCalls: { increment: 1 },
      },
      create: {
        id: dropid("aus"),
        workspaceId: keyInfo.workspaceId,
        apiKeyId: keyInfo.id,
        date: new Date(),
        service: "file_upload",
        totalCalls: 1,
        successCalls: 1,
        failedCalls: 0,
      },
    });



    // 17. Return success response
    return NextResponse.json({
      success: true,
      data: {
        id: fileRecord.id,
        name: originalFileName,
        size: fileSizeMB,
        mimeType: file.type,
        url: fileUrl,
        directUrl: urlData.publicUrl,
        createdAt: fileRecord.createdAt.toISOString(),
        metadata: metadata,
      },
    }, { status: 201 });

  } catch (error) {
    console.error("[V1_UPLOAD_ERROR]", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Optional: Add rate limiting headers
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}