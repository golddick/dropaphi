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

    const isImage = file.originalName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    // 🔥 Generate signed URL (valid for 60 seconds)
    
    const { data, error } = await supabaseAdmin.storage
    .from("workspace-files")
    .createSignedUrl(file.storageKey, 60);


    if (error || !data?.signedUrl) {
      return new Response(
        JSON.stringify({ error: error?.message }),
        { status: 500 }
      );
    }

    // Option 1: return JSON
    // return Response.json({
    //   url: data.signedUrl,
    // });

    // Option 2 (better UX): redirect directly
    return Response.redirect(data.signedUrl);

  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}



