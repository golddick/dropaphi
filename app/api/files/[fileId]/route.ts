// app/api/files/[fileId]/route.ts

import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = await params;

    const file = await db.file.findUnique({
      where: { id: fileId },
      select: {
        storageKey: true,
        originalName:true
      },
    });

    if (!file) {
      return new Response("File not found", { status: 404 });
    }

    // 🔥 Generate signed URL (valid for 60 seconds)
    const { data, error } = await supabaseAdmin.storage
      .from("workspace-files")
      .createSignedUrl(file.storageKey, 60, {
      download: file.originalName,
    });
      // .createSignedUrl(file.storageKey, 60);

    if (error || !data?.signedUrl) {
      return new Response(
        JSON.stringify({ error: error?.message }),
        { status: 500 }
      );
    }

    // Option 1: return JSON
    return Response.json({
      url: data.signedUrl,
    });

    // Option 2 (better UX): redirect directly
    // return Response.redirect(data.signedUrl);

  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}






// // app/api/files/[fileId]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { supabaseAdmin } from "@/lib/supabase/admin";
// import { db } from "@/lib/db";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ fileId: string }> }
// ) {
//   try {
//     const { fileId } = await params;
//     console.log("1. File ID received:", fileId);

//     if (!fileId) {
//       return new NextResponse("File ID is required", { status: 400 });
//     }

//     // Test database connection first
//     console.log("2. Testing database connection...");
//     try {
//       await db.$queryRaw`SELECT 1`;
//       console.log("3. Database connected successfully");
//     } catch (dbError) {
//       console.error("Database connection failed:", dbError);
//       return new NextResponse(
//         JSON.stringify({ error: "Database connection failed", details: String(dbError) }), 
//         { status: 500, headers: { 'Content-Type': 'application/json' } }
//       );
//     }

//     // Find the file in database
//     console.log("4. Querying file:", fileId);
//     const file = await db.file.findFirst({
//       where: { id: fileId },
//       select: {
//         workspaceId: true,
//         storageKey: true,
//         mimeType: true,
//         size: true,
//         name: true,
//         originalName: true,
//       },
//     });

//     if (!file) {
//       console.log("5. File not found");
//       return new NextResponse("File not found", { status: 404 });
//     }
//     console.log("6. File found:", { id: fileId, storageKey: file.storageKey });

//     // Test Supabase connection
//     console.log("7. Testing Supabase connection...");
//     const { data: bucketCheck, error: bucketError } = await supabaseAdmin.storage
//       .listBuckets();
    
//     if (bucketError) {
//       console.error("Supabase connection failed:", bucketError);
//       return new NextResponse(
//         JSON.stringify({ error: "Supabase connection failed", details: bucketError.message }), 
//         { status: 500, headers: { 'Content-Type': 'application/json' } }
//       );
//     }
//     console.log("8. Supabase connected, buckets:", bucketCheck?.length);

//     // Download from Supabase using storageKey
//     console.log("9. Downloading file from Supabase:", file.storageKey);
//     const { data, error } = await supabaseAdmin.storage
//       .from("workspace-files")
//       .download(file.storageKey);

//     if (error || !data) {
//       console.error("Supabase download error:", error);
//       return new NextResponse(
//         JSON.stringify({ error: "File download failed", details: error?.message }), 
//         { status: 404, headers: { 'Content-Type': 'application/json' } }
//       );
//     }
//     console.log("10. File downloaded, size:", data.size);

//     const buffer = Buffer.from(await data.arrayBuffer());

//     const isImage = file.mimeType?.startsWith("image/");
//     const isPdf = file.mimeType === "application/pdf";
//     const isInline = isImage || isPdf;
//     const displayName = file.originalName || file.name;

//     console.log("11. Sending response, inline:", isInline);
//     return new NextResponse(buffer, {
//       status: 200,
//       headers: {
//         "Content-Type": file.mimeType || "application/octet-stream",
//         "Content-Length": file.size?.toString() || "0",
//         "Cache-Control": "public, max-age=31536000, immutable",
//         "Content-Disposition": isInline ? "inline" : `attachment; filename="${encodeURIComponent(displayName)}"`,
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "GET, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type",
//       },
//     });
//   } catch (error) {
//     console.error("[FILE_SERVE_ERROR] Detailed error:", error);
//     return new NextResponse(
//       JSON.stringify({ 
//         error: "Internal Server Error", 
//         details: error instanceof Error ? error.message : "Unknown error",
//         stack: error instanceof Error ? error.stack : undefined
//       }), 
//       { 
//         status: 500,
//         headers: {
//           'Content-Type': 'application/json',
//           "Access-Control-Allow-Origin": "*",
//         },
//       }
//     );
//   }
// }

// export async function OPTIONS() {
//   return new NextResponse(null, {
//     status: 204,
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "GET, OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type",
//       "Access-Control-Max-Age": "86400",
//     },
//   });
// }




