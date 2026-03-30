


// app/api/v1/files/[fileId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateApiKey } from "@/lib/api-key/validate";
import { handleCORS, addCORSHeaders } from "@/lib/cors";

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return handleCORS(req);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = await params;

    console.log("[FILE_ACCESS] Looking for file with ID:", fileId);

    // 1️⃣ Find file by ID
    const file = await db.file.findUnique({
      where: {
        id: fileId, // This should match your file.id field
      },
      select: {
        id: true,
        name: true,
        originalName: true,
        mimeType: true,
        size: true,
        storageKey: true,
        directUrl: true,
        visibility: true,
        workspaceId: true,
        createdAt: true,
        metadata: true,
      },
    });

    if (!file) {
      console.log("[FILE_ACCESS] File not found:", fileId);
      const response = NextResponse.json(
        { 
          success: false, 
          error: "File not found",
          fileId: fileId 
        },
        { status: 404 }
      );
      return addCORSHeaders(response);
    }

    console.log("[FILE_ACCESS] Found file:", {
      id: file.id,
      name: file.originalName,
      visibility: file.visibility,
      workspaceId: file.workspaceId
    });

    // 2️⃣ If file is PUBLIC, serve directly without auth
    if (file.visibility === "PUBLIC") {
      // Get file from Supabase storage
      const { data: urlData } = supabaseAdmin.storage
        .from("workspace-files")
        .getPublicUrl(file.storageKey);

      // For browser access, redirect to the actual file
      // For API access, return JSON with URL
      const acceptHeader = req.headers.get("accept") || "";
      
      if (acceptHeader.includes("text/html")) {
        // Browser is requesting - redirect to actual file
        const response = NextResponse.redirect(urlData.publicUrl);
        return addCORSHeaders(response);
      } else {
        // API request - return JSON
        const response = NextResponse.json({
          success: true,
          data: {
            id: file.id,
            name: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
            url: urlData.publicUrl,
            directUrl: file.directUrl,
            visibility: file.visibility,
            createdAt: file.createdAt,
          }
        });
        return addCORSHeaders(response);
      }
    }

    // 3️⃣ If file is PRIVATE, validate API key
    const validation = await validateApiKey(req);
    if (!validation.valid) {
      const response = NextResponse.json(
        { 
          success: false, 
          error: validation.error,
          message: "This file is private. Please provide a valid API key."
        },
        { status: validation.status || 401 }
      );
      return addCORSHeaders(response);
    }

    const { keyInfo } = validation;
    if (!keyInfo) {
      const response = NextResponse.json(
        { 
          success: false, 
          error: "Invalid API key information" 
        },
        { status: 401 }
      );
      return addCORSHeaders(response);
    }

    // 4️⃣ Check if API key belongs to the same workspace
    if (keyInfo.workspaceId !== file.workspaceId) {
      const response = NextResponse.json(
        { 
          success: false, 
          error: "Access denied. This file belongs to a different workspace." 
        },
        { status: 403 }
      );
      return addCORSHeaders(response);
    }


    // 6️⃣ Serve the private file
    const { data: urlData } = supabaseAdmin.storage
      .from("workspace-files")
      .getPublicUrl(file.storageKey);

    const acceptHeader = req.headers.get("accept") || "";
    
    if (acceptHeader.includes("text/html")) {
      // Browser is requesting - redirect to actual file
      const response = NextResponse.redirect(urlData.publicUrl);
      return addCORSHeaders(response);
    } else {
      // API request - return JSON
      const response = NextResponse.json({
        success: true,
        data: {
          id: file.id,
          name: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          url: urlData.publicUrl,
          directUrl: file.directUrl,
          visibility: file.visibility,
          createdAt: file.createdAt,
        }
      });
      return addCORSHeaders(response);
    }

  } catch (error) {
    console.error("[V1_FILE_ACCESS_ERROR]", error);
    const response = NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
    return addCORSHeaders(response);
  }
}