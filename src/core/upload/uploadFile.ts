import type { SupabaseClient } from "@supabase/supabase-js";
import { downscaleImage } from "./downscaleImage";

export type UploadFileOptions = {
  supabase: SupabaseClient;
  bucket: string;
  path: string;
  file: File;
  /** Default true for images */
  downscale?: boolean;
  upsert?: boolean;
};

export type UploadFileResult = {
  path: string;
  publicUrl: string;
};

export async function uploadFile({
  supabase,
  bucket,
  path,
  file,
  downscale = true,
  upsert = true,
}: UploadFileOptions): Promise<UploadFileResult> {
  const payload =
    downscale && file.type.startsWith("image/")
      ? await downscaleImage(file)
      : file;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, payload, { upsert });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return { path, publicUrl };
}

/** Build a unique storage path: `{prefix}/{timestamp}-{safeName}` */
export function buildUploadPath(prefix: string, fileName: string) {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const ext = safe.includes(".") ? safe.split(".").pop() : "bin";
  const base = safe.replace(/\.[^.]+$/, "") || "file";
  return `${prefix.replace(/\/$/, "")}/${Date.now()}-${base}.${ext}`;
}
