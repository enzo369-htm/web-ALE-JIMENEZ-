"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/core/supabase/client";

type TechTable = "works" | "paintings";

export default function TechSheetModal({
  open,
  onClose,
  title,
  table,
  entityId,
  initialText,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  table: TechTable;
  entityId: string;
  initialText: string | null;
  onSaved: (text: string | null) => void;
}) {
  const [text, setText] = useState(initialText ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setText(initialText ?? "");
    setMessage("");
  }, [open, entityId, initialText]);

  if (!open) return null;

  async function save() {
    setSaving(true);
    setMessage("");
    const next = text.trim() || null;
    const supabase = createClient();
    const { error } = await supabase
      .from(table)
      .update({ tech_sheet_text: next })
      .eq("id", entityId);
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    onSaved(next);
    setMessage("Ficha técnica guardada.");
  }

  async function clear() {
    setText("");
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from(table)
      .update({ tech_sheet_text: null })
      .eq("id", entityId);
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    onSaved(null);
    setMessage("Ficha técnica eliminada.");
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
              Texto fijo debajo del cuadro al abrirlo en grande.
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

        <textarea
          className="min-h-32 w-full border border-gray-300 px-3 py-2 text-sm"
          placeholder={"ej.\nóleo sobre tela\n120 × 90 cm\n2026"}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void clear()}
            className="text-sm text-red-600 disabled:opacity-50"
          >
            Clear
          </button>
          {message && <p className="text-sm text-gray-600">{message}</p>}
        </div>
      </div>
    </div>
  );
}
