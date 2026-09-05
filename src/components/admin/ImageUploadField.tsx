"use client";

import { useRef, useState } from "react";
import { createClient } from "@/core/supabase/client";
import { buildUploadPath, uploadFile } from "@/core/upload";

const BUCKET = process.env.NEXT_PUBLIC_UPLOAD_BUCKET || "uploads";

export default function ImageUploadField({
  label = "Upload image",
  prefix,
  value,
  onUploaded,
  accept = "image/*",
  downscale = true,
}: {
  label?: string;
  prefix: string;
  value?: string | null;
  onUploaded: (url: string) => void;
  accept?: string;
  downscale?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      if (accept.includes("pdf")) {
        const isPdf =
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
          throw new Error("Please upload a PDF file.");
        }
      }
      const supabase = createClient();
      const path = buildUploadPath(prefix, file.name);
      const { publicUrl } = await uploadFile({
        supabase,
        bucket: BUCKET,
        path,
        file,
        downscale,
      });
      onUploaded(publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="border border-line px-3 py-2 text-sm disabled:opacity-50"
        >
          {uploading ? "Uploading…" : label}
        </button>
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted underline underline-offset-2"
          >
            Open current
          </a>
        )}
      </div>
      {value && accept.startsWith("image") && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="max-h-32 w-auto border border-line" />
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
