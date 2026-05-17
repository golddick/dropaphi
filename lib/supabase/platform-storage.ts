// lib/supabase/platform-storage.ts
import { supabaseAdmin } from "./admin";
import { randomUUID } from "crypto";

export interface UploadResult {
  url: string;
  path: string;
  bucket: string;
}

export async function uploadPlatformFile(
  type: string,
  file: File,
  entityType: string,
  entityId: string | null
): Promise<UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
      const fileExt = file.name.split(".").pop(); 
     const extension =`${randomUUID()}.${fileExt}`;
    const fileName = `${timestamp}-${extension}`;
    
    // Organize by type and entity
    let folderPath = "";
    if (entityType === "demo") {
      folderPath = `demos/${type}s`;
    } else if (entityType === "avatar") {
      folderPath = `avatars/${entityId || "general"}`;
    } else if (entityType === "blog") {
      folderPath = `blogs/${entityId || "general"}/images`;
    } else {
      folderPath = `${entityType}/${type}s`;
    }
    
    const filePath = `${folderPath}/${fileName}`;
    const bucket = "platform-files";

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: publicUrlData.publicUrl,
      path: filePath,
      bucket: bucket,
    };
  } catch (error) {
    console.error("[PLATFORM_STORAGE_UPLOAD]", error);
    throw error;
  }
}

export async function deletePlatformFile(path: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.storage
      .from("platform-files")
      .remove([path]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[PLATFORM_STORAGE_DELETE]", error);
    return false;
  }
}