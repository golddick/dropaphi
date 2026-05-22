// app/api/v1/storage/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateApiKey } from "@/lib/api-key/validate";
import { z } from "zod";
import { handleCORS, addCORSHeaders } from "@/lib/cors";
import { checkWorkspaceStorageLimit, deductWorkspaceStorage } from "@/lib/v1-api/workspace/sender";
import { checkServiceStatus } from "@/lib/services/service-status";
import { Services } from "@/lib/generated/prisma";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
  "image/bmp", "image/tiff", "application/pdf", "text/plain", "text/csv",
  "application/json", "application/xml", "application/rtf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.text", "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation", "application/zip",
  "application/x-zip-compressed", "application/x-rar-compressed",
  "application/x-7z-compressed", "application/x-tar", "application/gzip",
];

const uploadMetadataSchema = z.object({
  folder: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  filename: z.string().optional(),
});

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_');
}

function generateUniqueFileName(originalName: string, customName?: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop() || '';
  const baseName = originalName.split('.').slice(0, -1).join('.');
  
  if (customName) {
    const sanitized = sanitizeFileName(customName);
    return `${timestamp}-${sanitized}.${extension}`;
  }
  
  const sanitized = sanitizeFileName(baseName);
  return `${timestamp}-${sanitized}.${extension}`;
}

function bytesToMB(bytes: number): number {
  return Number((bytes / (1024 * 1024)).toFixed(2));
}

function calculateStorageUnits(fileSizeMB: number): number {
  return Math.max(1, Math.ceil(fileSizeMB));
}

export async function OPTIONS(req: NextRequest) {
  return handleCORS(req);
}

export async function POST(req: NextRequest) {
  let storageUnits = 0;
  
  try {
    // 0. Check if storage service is active
    const serviceStatusError = await checkServiceStatus(Services.STORAGE);
    if (serviceStatusError) {
      return addCORSHeaders(serviceStatusError);
    }
    
    // 1. Validate API key
    const validation = await validateApiKey(req);
    if (!validation.valid) {
      const response = NextResponse.json(
        { success: false, error: validation.error },
        { status: validation.status || 401 }
      );
      return addCORSHeaders(response);
    }

    const { keyInfo } = validation;
    if (!keyInfo) {
      const response = NextResponse.json(
        { success: false, error: "Invalid API key information" },
        { status: 401 }
      );
      return addCORSHeaders(response);
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const metadataStr = formData.get("metadata") as string | null;

    if (!file) {
      const response = NextResponse.json(
        { success: false, error: "No file uploaded. Please provide a file in the 'file' field." },
        { status: 400 }
      );
      return addCORSHeaders(response);
    }

    // 3. Parse metadata
    let metadata = {};
    if (metadataStr) {
      try {
        const parsed = JSON.parse(metadataStr);
        const validated = uploadMetadataSchema.parse(parsed);
        metadata = validated;
      } catch (error) {
        const response = NextResponse.json(
          { 
            success: false, 
            error: "Invalid metadata format",
            details: error instanceof Error ? error.message : "Parse error"
          },
          { status: 400 }
        );
        return addCORSHeaders(response);
      }
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const response = NextResponse.json(
        { 
          success: false, 
          error: "File too large",
          maxSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
          yourSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
        },
        { status: 400 }
      );
      return addCORSHeaders(response);
    }

    // 5. Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      const response = NextResponse.json(
        { 
          success: false, 
          error: "File type not allowed",
          yourType: file.type
        },
        { status: 400 }
      );
      return addCORSHeaders(response);
    }

    // 6. Calculate file size in MB and storage units
    const fileSizeMB = bytesToMB(file.size);
    storageUnits = calculateStorageUnits(fileSizeMB);
    
    // 7. CHECK storage limit (but DON'T deduct yet)
    const limitCheck = await checkWorkspaceStorageLimit(keyInfo.workspaceId, storageUnits);
    
    if (!limitCheck.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Storage limit exceeded",
          details: {
            limit: limitCheck.limit,
            current: limitCheck.current,
            remaining: limitCheck.remaining,
            requested: storageUnits,
            fileSizeMB: fileSizeMB
          }
        },
        { status: 429 }
      );
      return addCORSHeaders(response);
    }

    // 8. Generate file info
    const fileId = dropid("fil");
    const originalFileName = file.name;
    const customFileName = (metadata as any).filename;
    const uniqueFileName = generateUniqueFileName(originalFileName, customFileName);
    const storageKey = `${keyInfo.workspaceId}/${uniqueFileName}`;

    // 9. Upload to Supabase
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
      console.error("[UPLOAD_ERROR]", uploadError);
      const response = NextResponse.json(
        { 
          success: false, 
          error: "Failed to upload file: " + uploadError.message,
          billing: {
            deducted: false,
            message: "No credits were deducted because the upload failed."
          }
        },
        { status: 500 }
      );
      return addCORSHeaders(response);
    }

    // 10. Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("workspace-files")
      .getPublicUrl(storageKey);

    // 11. Generate CDN URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dropaphi.xyz';
    const cdnUrl = `${baseUrl}/api/files/${fileId}`;

    // 12. UPLOAD SUCCESSFUL - NOW DEDUCT STORAGE CREDITS
    const deductionResult = await deductWorkspaceStorage(keyInfo.workspaceId, storageUnits);

    if (!deductionResult.success) {
      console.error("[CRITICAL] File uploaded but deduction failed:", {
        fileId,
        workspaceId: keyInfo.workspaceId,
        storageKey,
        units: storageUnits,
        error: deductionResult.error
      });
    }

    // 13. Create file record in database
    const fileRecord = await db.file.create({
      data: {
        id: fileId,
        workspaceId: keyInfo.workspaceId,
        name: uniqueFileName,
        originalName: originalFileName,
        mimeType: file.type,
        size: file.size,
        storageKey,
        cdnUrl: cdnUrl,
        directUrl: urlData.publicUrl,
        visibility: (metadata as any).visibility || 'PUBLIC',
        metadata: {
          uploadedFrom: "api_v1",
          apiKeyId: keyInfo.id,
          apiKeyName: keyInfo.name,
          isTestKey: keyInfo.isTest,
          originalSize: file.size,
          sizeMB: fileSizeMB,
          storageUnits: storageUnits,
          billingMethod: deductionResult.success ? deductionResult.method : null,
          billingCost: deductionResult.success ? deductionResult.cost : null,
          billingStatus: deductionResult.success ? "SUCCESS" : "FAILED",
          folder: (metadata as any).folder,
          tags: (metadata as any).tags,
          description: (metadata as any).description,
        },
      },
    });

    // 14. Log API usage (only if deduction succeeded)
    if (deductionResult.success) {
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
    }

    // 15. Return success response
    const response = NextResponse.json({
      success: true,
      data: {
        id: fileRecord.id,
        name: originalFileName,
        size: fileSizeMB,
        mimeType: file.type,
        url: cdnUrl,
        directUrl: urlData.publicUrl,
        createdAt: fileRecord.createdAt.toISOString(),
        metadata: metadata,
        billing: deductionResult.success ? {
          method: deductionResult.method,
          unitsUsed: storageUnits,
          fileSizeMB: fileSizeMB,
          cost: deductionResult.cost,
          message: deductionResult.message,
          ...(deductionResult.method === "BALANCE" && {
            remainingBalance: deductionResult.remainingBalance
          }),
          ...(deductionResult.method === "SERVICE_CREDITS" && {
            remainingCredits: deductionResult.remainingCredits
          })
        } : {
          deducted: false,
          warning: "File uploaded but billing failed. Our team has been notified.",
          error: deductionResult.error
        }
      },
    }, { status: 201 });
    
    return addCORSHeaders(response);

  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    const response = NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        billing: {
          deducted: false,
          message: "No credits were deducted due to an error."
        }
      },
      { status: 500 }
    );
    return addCORSHeaders(response);
  }
}





// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { dropid } from "dropid";
// import { supabaseAdmin } from "@/lib/supabase/admin";
// import { validateApiKey } from "@/lib/api-key/validate";
// import { z } from "zod";
// import { handleCORS, addCORSHeaders } from "@/lib/cors"; // Add this import

// const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
// const ALLOWED_MIME_TYPES = [
//   // Images
//   "image/jpeg",
//   "image/png", 
//   "image/webp",
//   "image/gif",
//   "image/svg+xml",
//   "image/bmp",
//   "image/tiff",
  
//   // Documents
//   "application/pdf",
//   "text/plain",
//   "text/csv",
//   "application/json",
//   "application/xml",
//   "application/rtf",
//   "application/msword", // .doc
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
//   "application/vnd.ms-word.document.macroEnabled.12",
//   "application/vnd.ms-excel", // .xls
//   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
//   "application/vnd.ms-excel.sheet.macroEnabled.12",
//   "application/vnd.ms-powerpoint", // .ppt
//   "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
//   "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
  
//   // OpenOffice/LibreOffice formats
//   "application/vnd.oasis.opendocument.text", // .odt
//   "application/vnd.oasis.opendocument.spreadsheet", // .ods
//   "application/vnd.oasis.opendocument.presentation", // .odp
  
//   // Archives
//   "application/zip",
//   "application/x-zip-compressed",
//   "application/x-rar-compressed",
//   "application/x-7z-compressed",
//   "application/x-tar",
//   "application/gzip",
// ];

// // Validation schema for upload metadata
// const uploadMetadataSchema = z.object({
//   folder: z.string().optional(),
//   visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
//   tags: z.array(z.string()).optional(),
//   description: z.string().optional(),
//   filename: z.string().optional(), // Custom filename (optional)
// });

// // Helper function to sanitize filename
// function sanitizeFileName(fileName: string): string {
//   return fileName
//     .normalize('NFD')
//     .replace(/[\u0300-\u036f]/g, '')
//     .replace(/[^a-zA-Z0-9.-]/g, '_')
//     .replace(/_+/g, '_');
// }

// // Helper function to generate unique filename
// function generateUniqueFileName(originalName: string, customName?: string): string {
//   const timestamp = Date.now();
  
//   if (customName) {
//     const sanitized = sanitizeFileName(customName);
//     const ext = originalName.split('.').pop();
//     return `${timestamp}-${sanitized}.${ext}`;
//   }
  
//   const sanitized = sanitizeFileName(originalName);
//   return `${timestamp}-${sanitized}`;
// }

// function bytesToMB(bytes: number | bigint): number {
//   const bytesNum = typeof bytes === 'bigint' ? Number(bytes) : bytes;
//   // Round to 2 decimal places for accuracy
//   return Math.round((bytesNum / (1024 * 1024)) * 100) / 100;
// }

// // Handle OPTIONS requests for CORS preflight
// export async function OPTIONS(req: NextRequest) {
//   return handleCORS(req);
// }

// export async function POST(req: NextRequest) {
//   try {
//     // 1. Validate API key
//     const validation = await validateApiKey(req);
//     if (!validation.valid) {
//       const response = NextResponse.json(
//         { 
//           success: false,
//           error: validation.error 
//         },
//         { status: validation.status || 401 }
//       );
//       return addCORSHeaders(response);
//     }

//     const { keyInfo } = validation;
//     if (!keyInfo) {
//       const response = NextResponse.json(
//         { 
//           success: false,
//           error: "Invalid API key information" 
//         },
//         { status: 401 }
//       );
//       return addCORSHeaders(response);
//     }

//     // 2. Check if test key can upload (optional - you might want to restrict test keys)
//     if (keyInfo.isTest) {
//       console.log(`Test key ${keyInfo.id} used for upload`);
//     }

//     // // 3. Get workspace with limits
//     // const workspace = await db.workspace.findUnique({
//     //   where: { id: keyInfo.workspaceId },
//     //   select: {
//     //     storageLimit: true,
//     //     currentStorageUsed: true,
//     //     name: true,
//     //   }
//     // });

//     // if (!workspace) {
//     //   const response = NextResponse.json(
//     //     { 
//     //       success: false,
//     //       error: "Workspace not found" 
//     //     },
//     //     { status: 404 }
//     //   );
//     //   return addCORSHeaders(response);
//     // }

//     // // 4. Check workspace storage quota
//     // if (workspace.storageLimit > 0 && workspace.currentStorageUsed >= workspace.storageLimit) {
//     //   const response = NextResponse.json(
//     //     { 
//     //       success: false,
//     //       error: "Storage limit reached",
//     //       message: `Your workspace has reached its limit of ${workspace.storageLimit} MB. Please upgrade your plan to upload more.`
//     //     },
//     //     { status: 403 }
//     //   );
//     //   return addCORSHeaders(response);
//     // }


//      const limitCheck = await checkWorkspaceStorageLimit(keyInfo.workspaceId);
//         if (!limitCheck.allowed) {
//           const response = NextResponse.json(
//             {
//               success: false,
//               error: "Email limit exceeded",
//               limit: limitCheck.limit,
//               current: limitCheck.current,
//               remaining: limitCheck.remaining,
//             },
//             { status: 429 }
//           );
//           return addCORSHeaders(response);
//         } 

//     // 4. Parse form data
//     const formData = await req.formData();
//     const file = formData.get("file") as File;
//     const metadataStr = formData.get("metadata") as string | null;

//     if (!file) {
//       const response = NextResponse.json(
//         { 
//           success: false,
//           error: "No file uploaded. Please provide a file in the 'file' field." 
//         },
//         { status: 400 }
//       );
//       return addCORSHeaders(response);
//     }

//     // 5. Parse metadata if provided
//     let metadata = {};
//     if (metadataStr) {
//       try {
//         const parsed = JSON.parse(metadataStr);
//         const validated = uploadMetadataSchema.parse(parsed);
//         metadata = validated;
//       } catch (error) {
//         const response = NextResponse.json(
//           { 
//             success: false,
//             error: "Invalid metadata format. Please provide valid JSON.",
//             details: error instanceof Error ? error.message : "Parse error"
//           },
//           { status: 400 }
//         );
//         return addCORSHeaders(response);
//       }
//     }

//     // 6. Validate file size
//     if (file.size > MAX_FILE_SIZE) {
//       const response = NextResponse.json(
//         { 
//           success: false,
//           error: "File too large",
//           maxSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
//           yourSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
//         },
//         { status: 400 }
//       );
//       return addCORSHeaders(response);
//     }

//     // 7. Validate mime type
//     if (!ALLOWED_MIME_TYPES.includes(file.type)) {
//       const response = NextResponse.json(
//         { 
//           success: false,
//           error: "File type not allowed",
//           allowedTypes: ALLOWED_MIME_TYPES,
//           yourType: file.type
//         },
//         { status: 400 }
//       );
//       return addCORSHeaders(response);
//     }
 
//     // 8. Check file limit
//     const fileSizeMB = bytesToMB(file.size);
//     if (workspace.currentStorageUsed + fileSizeMB > workspace.storageLimit) {
//       const response = NextResponse.json(
//         {
//           success: false,
//           error: "Storage limit exceeded",
//           used: `${workspace.currentStorageUsed.toFixed(2)}MB`,
//           limit: `${workspace.storageLimit}MB`,
//           needed: `${(workspace.currentStorageUsed + fileSizeMB).toFixed(2)}MB`
//         },
//         { status: 403 }
//       );
//       return addCORSHeaders(response);
//     }

//     // 9. Generate file info
//     const fileId = dropid("fil");
//     const originalFileName = file.name;
//     const customFileName = 'DROPAPHI';
//     const uniqueFileName = generateUniqueFileName(originalFileName, customFileName);
//     const storageKey = `${keyInfo.workspaceId}/${uniqueFileName}`;

//     // 10. Convert to buffer and upload to Supabase
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     const { error: uploadError } = await supabaseAdmin.storage
//       .from("workspace-files")
//       .upload(storageKey, buffer, {
//         cacheControl: "3600",
//         upsert: false,
//         contentType: file.type,
//       });

//     if (uploadError) {
//       console.error("[V1_UPLOAD_ERROR]", uploadError);
//       const response = NextResponse.json(
//         { 
//           success: false,
//           error: "Failed to upload file to storage: " + uploadError.message 
//         },
//         { status: 500 }
//       );
//       return addCORSHeaders(response);
//     }

//     // 11. Get public URL from Supabase
//     const { data: urlData } = supabaseAdmin.storage
//       .from("workspace-files")
//       .getPublicUrl(storageKey);

//     // 12. Generate API URL for the file
//     const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dropaphi.xyz';
//     const cdnUrl = `${baseUrl}/api/files/${fileId}`;

//     // 13. Create file record in database  
//     const fileRecord = await db.file.create({
//       data: {
//         id: fileId,
//         workspaceId: keyInfo.workspaceId,
//         name: uniqueFileName,
//         originalName: originalFileName,
//         mimeType: file.type,
//         size: file.size, // Store actual bytes as per schema expectation (usually BigInt/Number in bytes)
//         storageKey,
//         cdnUrl: cdnUrl,
//         directUrl: urlData.publicUrl,
//         visibility: (metadata as any).visibility || 'PUBLIC',
//         metadata: {
//           uploadedFrom: "api_v1",
//           apiKeyId: keyInfo.id,
//           apiKeyName: keyInfo.name,
//           isTestKey: keyInfo.isTest,
//           originalSize: file.size,
//           sizeMB: fileSizeMB,
//           folder: (metadata as any).folder,
//           tags: (metadata as any).tags,
//           description: (metadata as any).description,
//         },
//       },
//     });

//     // 14. Update workspace usage
//     await db.workspace.update({
//       where: { id: keyInfo.workspaceId },
//       data: {
//         currentStorageUsed: {
//           increment: fileSizeMB, // Usually currentFilesUsed refers to count, while storageUsed would be bytes
//         },
//       },
//     });

//     // 15. Log API usage
//     await db.aPiUsageSummary.upsert({
//       where: {
//         workspaceId_date_service: {
//           workspaceId: keyInfo.workspaceId,
//           date: new Date(),
//           service: "file_upload",
//         }
//       },
//       update: {
//         totalCalls: { increment: 1 },
//         successCalls: { increment: 1 },
//       },
//       create: {
//         id: dropid("aus"),
//         workspaceId: keyInfo.workspaceId,
//         apiKeyId: keyInfo.id,
//         date: new Date(),
//         service: "file_upload",
//         totalCalls: 1,
//         successCalls: 1,
//         failedCalls: 0,
//       },
//     });

//     // 17. Return success response
//     const response = NextResponse.json({
//       success: true,
//       data: {
//         id: fileRecord.id,
//         name: originalFileName,
//         size: fileSizeMB,
//         mimeType: file.type,
//         url: cdnUrl,
//         directUrl: urlData.publicUrl,
//         createdAt: fileRecord.createdAt.toISOString(),
//         metadata: metadata,
//       },
//     }, { status: 201 });
    
//     return addCORSHeaders(response);

//   } catch (error) {
//     console.error("[V1_UPLOAD_ERROR]", error);
//     const response = NextResponse.json(
//       { 
//         success: false,
//         error: "Internal server error",
//         message: error instanceof Error ? error.message : "Unknown error"
//       },
//       { status: 500 }
//     );
//     return addCORSHeaders(response);
//   }
// }