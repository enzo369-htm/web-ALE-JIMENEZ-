"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/core/supabase/client";
import ImageUploadField from "@/components/admin/ImageUploadField";

type TechTable = "works" | "paintings";

export default function TechSheetModal({
  open,
  onClose,
  title,
  table,
  entityId,
  initialUrl,
  uploadPrefix,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  table: TechTable;
  entityId: string;
  initialUrl: string | null;
  uploadPrefix: string;
  onSaved: (url: string | null) => void;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setUrl(initialUrl);
    setMessage("");
  }, [open, entityId, initialUrl]);

  if (!open) return null;

  async function save(next: string | null) {
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from(table)
      .update({ tech_sheet_url: next })
      .eq("id", entityId);
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setUrl(next);
    onSaved(next);
    setMessage(next ? "Ficha técnica guardada." : "Ficha técnica eliminada.");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Ficha técnica — ${title}`}
    >
      <div className="w-full max-w-lg space-y-4 border border-gray-200 bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono-ui text-[11px] uppercase tracking-wide text-muted">
              Cargar ficha técnica
            </p>
            <h2 className="text-lg font-medium">{title}</h2>
            <p className="mt-1 text-sm text-gray-600">
              Se muestra fija debajo del cuadro al abrirlo en grande (no en el
              canvas libre).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono-ui text-xs uppercase tracking-wide text-muted hover:text-ink"
          >
            Close
          </button>
        </div>

        <ImageUploadField
          label="Upload ficha"
          prefix={uploadPrefix}
          value={url ?? ""}
          onUploaded={(next) => void save(next)}
          downscale={false}
        />

        {url && (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Ficha técnica preview"
              className="mx-auto max-h-64 w-auto object-contain"
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => void save(null)}
              className="text-sm text-red-600 disabled:opacity-50"
            >
              Remove ficha técnica
            </button>
          </div>
        )}

        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
