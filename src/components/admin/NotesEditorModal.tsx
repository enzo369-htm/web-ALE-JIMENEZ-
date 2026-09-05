"use client";

import { useEffect, useRef, useState } from "react";
import {
  CanvasEditor,
  defaultPositionForIndex,
  type CanvasItem,
} from "@/core/free-canvas";
import { createClient } from "@/core/supabase/client";
import { buildUploadPath, uploadFile } from "@/core/upload";
import {
  LIGHTBOX_CENTER_IMG_CLASS,
  LIGHTBOX_STAGE_PAD,
} from "@/lib/lightbox-stage";

const BUCKET = process.env.NEXT_PUBLIC_UPLOAD_BUCKET || "uploads";

export type NoteRecord = {
  id: string;
  image_url: string;
  x: number;
  y: number;
  width: number;
  sort_order: number;
};

type NotesTable = "work_notes" | "painting_notes";
type ForeignKey = "work_id" | "painting_id";

export default function NotesEditorModal({
  open,
  onClose,
  title,
  centerImageUrl,
  uploadPrefix,
  table,
  foreignKey,
  entityId,
  initialNotes,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  centerImageUrl: string | null;
  uploadPrefix: string;
  table: NotesTable;
  foreignKey: ForeignKey;
  entityId: string;
  initialNotes: NoteRecord[];
  onSaved: (notes: NoteRecord[]) => void;
}) {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const knownIds = useRef(new Set<string>());
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const mapped = initialNotes.map((n) => ({
      id: n.id,
      imageUrl: n.image_url,
      x: n.x,
      y: n.y,
      width: n.width,
      label: "note",
    }));
    setItems(mapped);
    knownIds.current = new Set(initialNotes.map((n) => n.id));
    setSelectedId(null);
    setMessage("");
    // Seed editor only when opening / switching piece (not on every parent re-render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entityId]);

  if (!open) return null;

  async function handleAdd(file: File) {
    try {
      const supabase = createClient();
      const path = buildUploadPath(uploadPrefix, file.name);
      const { publicUrl } = await uploadFile({
        supabase,
        bucket: BUCKET,
        path,
        file,
        downscale: false,
      });
      const pos = defaultPositionForIndex(items.length);
      const tempId = `tmp-${Date.now()}`;
      setItems((prev) => [
        ...prev,
        { id: tempId, imageUrl: publicUrl, label: "note", ...pos },
      ]);
      setSelectedId(tempId);
      setMessage("Note added — save to persist. Prefer transparent PNG.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed");
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const currentIds = new Set(items.map((i) => i.id));
    const removed = [...knownIds.current].filter(
      (id) => !currentIds.has(id) && !id.startsWith("tmp-")
    );

    const next: NoteRecord[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const payload = {
        [foreignKey]: entityId,
        image_url: item.imageUrl,
        x: item.x,
        y: item.y,
        width: item.width,
        sort_order: i,
      };
      if (item.id.startsWith("tmp-") || !knownIds.current.has(item.id)) {
        const { data, error } = await supabase
          .from(table)
          .insert(payload)
          .select("id, image_url, x, y, width, sort_order")
          .single();
        if (error) {
          setSaving(false);
          setMessage(error.message);
          return;
        }
        next.push(data as NoteRecord);
      } else {
        const { error } = await supabase
          .from(table)
          .update(payload)
          .eq("id", item.id);
        if (error) {
          setSaving(false);
          setMessage(error.message);
          return;
        }
        next.push({
          id: item.id,
          image_url: item.imageUrl,
          x: item.x,
          y: item.y,
          width: item.width,
          sort_order: i,
        });
      }
    }

    if (removed.length) {
      const { error: delError } = await supabase
        .from(table)
        .delete()
        .in("id", removed);
      if (delError) {
        setSaving(false);
        setMessage(delError.message);
        return;
      }
    }

    setItems(
      next.map((n) => ({
        id: n.id,
        imageUrl: n.image_url,
        x: n.x,
        y: n.y,
        width: n.width,
        label: "note",
      }))
    );
    knownIds.current = new Set(next.map((n) => n.id));
    setSaving(false);
    setMessage("Notes saved.");
    onSaved(next);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-bg"
      role="dialog"
      aria-modal="true"
      aria-label={`Notes for ${title}`}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-6 py-5 md:px-10">
        <div>
          <p className="font-mono-ui text-[11px] uppercase tracking-wide text-muted">
            Cargar notas
          </p>
          <h2 className="text-sm md:text-base">{title}</h2>
          {message && (
            <p className="mt-1 text-xs text-muted">{message}</p>
          )}
          {!centerImageUrl && (
            <p className="mt-1 text-xs text-amber-700">
              Add a photo to this piece first — it centers like on the public
              site.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="bg-ink px-4 py-2 text-sm text-bg disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save notes"}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="border border-line px-3 py-2 text-sm"
          >
            + Add note image
          </button>
          {selectedId && (
            <button
              type="button"
              onClick={() => {
                setItems((prev) => prev.filter((i) => i.id !== selectedId));
                setSelectedId(null);
              }}
              className="border border-red-300 px-3 py-2 text-sm text-red-600"
            >
              Remove selected
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="font-mono-ui text-xs uppercase tracking-wide text-muted hover:text-ink"
          >
            Close
          </button>
        </div>
      </div>

      {/* Same stage as public WorkLightbox desktop — % coords match 1:1 */}
      <div className={LIGHTBOX_STAGE_PAD}>
        <div className="relative hidden min-h-0 flex-1 overflow-hidden md:block">
          <CanvasEditor
            items={items}
            heightRatio={1}
            onChange={setItems}
            selectedId={selectedId}
            onSelect={setSelectedId}
            showHeightControl={false}
            fillContainer
            overlayCenterUrl={centerImageUrl}
            overlayCenterImgClassName={LIGHTBOX_CENTER_IMG_CLASS}
          />
        </div>

        {/* Mobile admin fallback: stacked, still no page scroll of a tall canvas */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden md:hidden">
          <p className="shrink-0 text-xs text-muted">
            Position notes on desktop for accurate placement. Mobile shows a
            simple stack.
          </p>
          {centerImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={centerImageUrl}
              alt={title}
              className="mx-auto max-h-[40vh] w-auto object-contain"
            />
          )}
          <div className="min-h-0 flex-1 overflow-auto">
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={
                    selectedId === item.id ? "outline outline-2 outline-ink" : ""
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-auto w-full"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleAdd(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
