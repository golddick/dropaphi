import { supabaseAdmin } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

export async function uploadWorkspaceFile(
  workspaceId: string,
  file: File
) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${randomUUID()}.${fileExt}`;
 
  const storagePath = `${workspaceId}/${fileName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from("workspace-files")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false
    });

  if (error) {
    throw new Error("Upload failed: " + error.message);
  }

  const { data } = supabaseAdmin.storage
    .from("workspace-files")
    .getPublicUrl(storagePath);

  return {
    path: storagePath,
    url: data.publicUrl
  };
}

