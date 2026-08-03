"use client";

import { useRef, useState } from "react";
import {
  CanvasEditor,
  defaultPositionForIndex,
  type CanvasItem,
} from "@/core/free-canvas";
import { createClient } from "@/core/supabase/client";
import { buildUploadPath, uploadFile } from "@/core/upload";

const BUCKET =
  process.env.NEXT_PUBLIC_UPLOAD_BUCKET || "uploads";

type PageRow = {
  id: string;
  height_ratio: number;
};

type ItemRow = {
  id: string;
  image_url: string;
  label: string | null;
  x: number;
  y: number;
  width: number;
};

function rowsToItems(rows: ItemRow[]): CanvasItem[] {
  return rows.map((r) => ({
    id: r.id,
    imageUrl: r.image_url,
    x: r.x,
    y: r.y,
    width: r.width,
    label: r.label ?? undefined,
  }));
}

export default function CanvasAdmin({
  page,
  initialItems,
}: {
  page: PageRow;
  initialItems: ItemRow[];
}) {
  const [items, setItems] = useState(() => rowsToItems(initialItems));
  const [heightRatio, setHeightRatio] = useState(page.height_ratio ?? 1.2);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const knownIds = useRef(new Set(initialItems.map((i) => i.id)));

  async function handleAddImage(file: File) {
    setUploading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const path = buildUploadPath("canvas", file.name);
      const { publicUrl } = await uploadFile({
        supabase,
        bucket: BUCKET,
        path,
        file,
      });
      const pos = defaultPositionForIndex(items.length);
      const tempId = `tmp-${Date.now()}`;
      setItems((prev) => [
        ...prev,
        {
          id: tempId,
          imageUrl: publicUrl,
          label: file.name,
          ...pos,
        },
      ]);
      setSelectedId(tempId);
      setMessage("Image added — remember to save.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const supabase = createClient();

    const { error: pageError } = await supabase
      .from("canvas_pages")
      .update({ height_ratio: heightRatio })
      .eq("id", page.id);

    if (pageError) {
      setSaving(false);
      setMessage(pageError.message);
      return;
    }

    const currentIds = new Set(items.map((i) => i.id));
    const removed = [...knownIds.current].filter(
      (id) => !currentIds.has(id) && !id.startsWith("tmp-")
    );
    if (removed.length) {
      await supabase.from("canvas_items").delete().in("id", removed);
    }

    const nextItems: CanvasItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const payload = {
        page_id: page.id,
        image_url: item.imageUrl,
        label: item.label ?? null,
        x: item.x,
        y: item.y,
        width: item.width,
        sort_order: i,
      };

      if (item.id.startsWith("tmp-") || !knownIds.current.has(item.id)) {
        const { data, error } = await supabase
          .from("canvas_items")
          .insert(payload)
          .select("id")
          .single();
        if (error) {
          setSaving(false);
          setMessage(error.message);
          return;
        }
        nextItems.push({ ...item, id: data.id });
      } else {
        const { error } = await supabase
          .from("canvas_items")
          .update(payload)
          .eq("id", item.id);
        if (error) {
          setSaving(false);
          setMessage(error.message);
          return;
        }
        nextItems.push(item);
      }
    }

    setItems(nextItems);
    knownIds.current = new Set(nextItems.map((i) => i.id));
    setSaving(false);
    setMessage("Saved.");
  }

  function removeSelected() {
    if (!selectedId) return;
    setItems((prev) => prev.filter((i) => i.id !== selectedId));
    setSelectedId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-black text-white text-sm disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2.5 border border-gray-300 text-sm disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "+ Add image"}
        </button>
        {selectedId && (
          <button
            type="button"
            onClick={removeSelected}
            className="px-4 py-2.5 border border-red-300 text-red-600 text-sm"
          >
            Remove selected
          </button>
        )}
        {message && (
          <span className="text-sm text-gray-600">{message}</span>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleAddImage(file);
          e.target.value = "";
        }}
      />

      <CanvasEditor
        items={items}
        heightRatio={heightRatio}
        onChange={setItems}
        onHeightRatioChange={setHeightRatio}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </div>
  );
}
