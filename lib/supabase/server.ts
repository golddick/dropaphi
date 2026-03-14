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




// import { createServerClient } from '@supabase/ssr'
// import { cookies } from 'next/headers'

// export async function createRouteClient() {
//   const cookieStore = await cookies()

//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name: string) {
//           return cookieStore.get(name)?.value
//         },
//         set(name: string, value: string, options: any) {
//           try {
//             cookieStore.set(name, value, options)
//           } catch (error) {
//             // Handle cookie setting error in server component
//           }
//         },
//         remove(name: string, options: any) {
//           try {
//             cookieStore.set(name, '', { ...options, maxAge: 0 })
//           } catch (error) {
//             // Handle cookie removal error in server component
//           }
//         },
//       },
//     }
//   )
// }