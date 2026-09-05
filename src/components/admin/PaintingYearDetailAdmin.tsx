"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  CanvasEditor,
  defaultPositionForIndex,
  type CanvasItem,
} from "@/core/free-canvas";
import { createClient } from "@/core/supabase/client";
import { buildUploadPath, uploadFile } from "@/core/upload";
import ImageUploadField from "@/components/admin/ImageUploadField";
import NotesEditorModal, {
  type NoteRecord,
} from "@/components/admin/NotesEditorModal";
import type {
  Painting,
  PaintingImage,
  PaintingNote,
  PaintingYear,
} from "@/lib/types";

const BUCKET = process.env.NEXT_PUBLIC_UPLOAD_BUCKET || "uploads";

type PaintingWithImages = Painting & { images: PaintingImage[] };

type CanvasRow = {
  id: string;
  image_url: string;
  label: string | null;
  x: number;
  y: number;
  width: number;
  painting_id: string | null;
};

function rowsToItems(
  rows: CanvasRow[]
): (CanvasItem & { paintingId?: string | null })[] {
  return rows.map((r) => ({
    id: r.id,
    imageUrl: r.image_url,
    x: r.x,
    y: r.y,
    width: r.width,
    label: r.label ?? undefined,
    paintingId: r.painting_id,
    meta: r.painting_id ? { workId: r.painting_id } : undefined,
  }));
}

export default function PaintingYearDetailAdmin({
  yearGroup: initialYear,
  paintings: initialPaintings,
  canvasPage,
  canvasItems: initialCanvas,
  paintingNotes: initialPaintingNotes,
}: {
  yearGroup: PaintingYear;
  paintings: PaintingWithImages[];
  canvasPage: { id: string; height_ratio: number } | null;
  canvasItems: CanvasRow[];
  paintingNotes: PaintingNote[];
}) {
  const [yearGroup, setYearGroup] = useState(initialYear);
  const [paintings, setPaintings] = useState(initialPaintings);
  const [notesByPaintingId, setNotesByPaintingId] = useState<
    Record<string, PaintingNote[]>
  >(() => {
    const map: Record<string, PaintingNote[]> = {};
    for (const n of initialPaintingNotes) {
      (map[n.painting_id] ??= []).push(n);
    }
    return map;
  });
  const [message, setMessage] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

  async function saveMeta() {
    setSavingMeta(true);
    setMessage("");
    const supabase = createClient();
    let canvasPageId = yearGroup.canvas_page_id;

    if (!canvasPageId) {
      const { data: page, error } = await supabase
        .from("canvas_pages")
        .insert({
          slug: `paintings-${yearGroup.slug}`,
          title: `${yearGroup.title} canvas`,
          height_ratio: 1.15,
        })
        .select("id")
        .single();
      if (error) {
        setSavingMeta(false);
        setMessage(error.message);
        return;
      }
      canvasPageId = page.id;
    }

    const { error } = await supabase
      .from("painting_years")
      .update({
        title: yearGroup.title,
        year: yearGroup.year,
        description: yearGroup.description,
        sort_order: yearGroup.sort_order,
        canvas_page_id: canvasPageId,
      })
      .eq("id", yearGroup.id);

    setSavingMeta(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setYearGroup((y) => ({ ...y, canvas_page_id: canvasPageId }));
    setMessage("Saved.");
  }

  const pageId = canvasPage?.id || yearGroup.canvas_page_id;

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/admin/paintings"
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Selected paintings
        </Link>
        <h1 className="mt-2 text-2xl font-medium">{yearGroup.title}</h1>
        <p className="text-sm text-gray-500">/{yearGroup.slug}</p>
      </div>

      <section className="space-y-4 border border-gray-200 p-4">
        <h2 className="font-medium">Details</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Title
            <input
              className="mt-1 w-full border border-gray-300 px-3 py-2"
              value={yearGroup.title}
              onChange={(e) =>
                setYearGroup({ ...yearGroup, title: e.target.value })
              }
            />
          </label>
          <label className="text-sm">
            Year
            <input
              className="mt-1 w-full border border-gray-300 px-3 py-2"
              value={yearGroup.year ?? ""}
              onChange={(e) =>
                setYearGroup({ ...yearGroup, year: e.target.value })
              }
            />
          </label>
          <label className="text-sm sm:col-span-2">
            Description
            <textarea
              className="mt-1 min-h-20 w-full border border-gray-300 px-3 py-2"
              value={yearGroup.description ?? ""}
              onChange={(e) =>
                setYearGroup({ ...yearGroup, description: e.target.value })
              }
            />
          </label>
          <label className="text-sm">
            Sort order
            <input
              type="number"
              className="mt-1 w-full border border-gray-300 px-3 py-2"
              value={yearGroup.sort_order}
              onChange={(e) =>
                setYearGroup({
                  ...yearGroup,
                  sort_order: Number(e.target.value) || 0,
                })
              }
            />
          </label>
        </div>
        <button
          type="button"
          disabled={savingMeta}
          onClick={() => void saveMeta()}
          className="bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {savingMeta ? "Saving…" : "Save details"}
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </section>

      <PaintingsSection
        yearId={yearGroup.id}
        paintings={paintings}
        onChange={setPaintings}
        notesByPaintingId={notesByPaintingId}
        onNotesSaved={(paintingId, notes) => {
          setNotesByPaintingId((prev) => ({
            ...prev,
            [paintingId]: notes.map((n) => ({
              ...n,
              painting_id: paintingId,
            })),
          }));
        }}
      />

      {(pageId || canvasPage?.id) && (
        <PaintingCanvasSection
          pageId={(pageId || canvasPage?.id)!}
          heightRatio={canvasPage?.height_ratio ?? 1.15}
          initialItems={initialCanvas}
          paintings={paintings}
        />
      )}

      {!pageId && !canvasPage?.id && (
        <section className="space-y-3 border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-medium text-amber-900">Free canvas missing</p>
          <p className="text-amber-800">
            This year group has no canvas yet. Click{" "}
            <strong>Save details</strong> above to create it, then reload the
            page. Also confirm you ran{" "}
            <code className="text-xs">supabase/015_painting_years_canvas.sql</code>
            .
          </p>
        </section>
      )}
    </div>
  );
}

function PaintingsSection({
  yearId,
  paintings,
  onChange,
  notesByPaintingId,
  onNotesSaved,
}: {
  yearId: string;
  paintings: PaintingWithImages[];
  onChange: (paintings: PaintingWithImages[]) => void;
  notesByPaintingId: Record<string, PaintingNote[]>;
  onNotesSaved: (paintingId: string, notes: NoteRecord[]) => void;
}) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [notesPaintingId, setNotesPaintingId] = useState<string | null>(null);

  const notesPainting =
    paintings.find((p) => p.id === notesPaintingId) ?? null;
  const notesCenter =
    notesPainting?.cover_image_url ||
    notesPainting?.images[0]?.image_url ||
    notesPainting?.image_url ||
    null;

  async function addPainting() {
    if (!title.trim()) return;
    setBusy(true);
    const supabase = createClient();
    const sortOrder =
      paintings.reduce((max, p) => Math.max(max, p.sort_order), 0) + 1;
    const { data, error } = await supabase
      .from("paintings")
      .insert({
        year_id: yearId,
        title: title.trim(),
        year: String(new Date().getFullYear()),
        medium: "oil on canvas",
        sort_order: sortOrder,
      })
      .select(
        "id, year_id, title, year, medium, image_url, cover_image_url, sort_order"
      )
      .single();
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    onChange([...paintings, { ...(data as Painting), images: [] }]);
    setTitle("");
    setMsg("Painting added.");
  }

  async function updatePainting(
    painting: PaintingWithImages,
    patch: Partial<Painting>
  ) {
    const supabase = createClient();
    const next = { ...painting, ...patch };
    const { error } = await supabase
      .from("paintings")
      .update({
        title: next.title,
        year: next.year,
        medium: next.medium,
        cover_image_url: next.cover_image_url,
        image_url: next.image_url ?? next.cover_image_url,
      })
      .eq("id", painting.id);
    if (error) {
      setMsg(error.message);
      return;
    }
    onChange(paintings.map((p) => (p.id === painting.id ? next : p)));
  }

  async function addImage(painting: PaintingWithImages, url: string) {
    const supabase = createClient();
    const sortOrder = painting.images.length;
    const { data, error } = await supabase
      .from("painting_images")
      .insert({
        painting_id: painting.id,
        image_url: url,
        sort_order: sortOrder,
      })
      .select("id, painting_id, image_url, sort_order")
      .single();
    if (error) {
      setMsg(error.message);
      return;
    }
    const images = [...painting.images, data as PaintingImage];
    const cover = painting.cover_image_url || url;
    await supabase
      .from("paintings")
      .update({ cover_image_url: cover, image_url: cover })
      .eq("id", painting.id);
    onChange(
      paintings.map((p) =>
        p.id === painting.id
          ? { ...p, images, cover_image_url: cover, image_url: cover }
          : p
      )
    );
  }

  async function removePainting(id: string) {
    if (!confirm("Delete this painting and its images?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("paintings").delete().eq("id", id);
    if (error) {
      setMsg(error.message);
      return;
    }
    onChange(paintings.filter((p) => p.id !== id));
  }

  return (
    <section className="space-y-4 border border-gray-200 p-4">
      <h2 className="font-medium">Paintings</h2>
      <p className="text-sm text-gray-600">
        Add a title, then photos. Place them on the free canvas below. Use{" "}
        <strong>Cargar notas</strong> for studio notes around the first image
        (lightbox only).
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Painting title"
          className="border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void addPainting()}
          className="border border-gray-300 px-3 py-2 text-sm"
        >
          Add painting
        </button>
      </div>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
      <ul className="space-y-6">
        {paintings.map((painting) => (
          <li key={painting.id} className="space-y-3 border border-gray-100 p-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                className="border border-gray-300 px-3 py-2 text-sm"
                value={painting.title}
                onChange={(e) =>
                  void updatePainting(painting, { title: e.target.value })
                }
              />
              <input
                className="border border-gray-300 px-3 py-2 text-sm"
                value={painting.year ?? ""}
                onChange={(e) =>
                  void updatePainting(painting, { year: e.target.value })
                }
                placeholder="Year"
              />
              <input
                className="border border-gray-300 px-3 py-2 text-sm"
                value={painting.medium ?? ""}
                onChange={(e) =>
                  void updatePainting(painting, { medium: e.target.value })
                }
                placeholder="Medium"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {painting.images.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.image_url}
                  alt=""
                  className="h-20 w-auto border border-gray-200 object-contain"
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ImageUploadField
                label="+ Photo"
                prefix={`paintings/${painting.id}`}
                onUploaded={(url) => void addImage(painting, url)}
              />
              <button
                type="button"
                onClick={() => setNotesPaintingId(painting.id)}
                className="border border-gray-300 px-3 py-2 text-sm"
              >
                Cargar notas
                {(notesByPaintingId[painting.id]?.length ?? 0) > 0
                  ? ` (${notesByPaintingId[painting.id].length})`
                  : ""}
              </button>
              <button
                type="button"
                onClick={() => void removePainting(painting.id)}
                className="text-sm text-red-600"
              >
                Delete painting
              </button>
            </div>
          </li>
        ))}
      </ul>

      {notesPainting && (
        <NotesEditorModal
          open
          onClose={() => setNotesPaintingId(null)}
          title={notesPainting.title}
          centerImageUrl={notesCenter}
          uploadPrefix={`painting-notes/${notesPainting.id}`}
          table="painting_notes"
          foreignKey="painting_id"
          entityId={notesPainting.id}
          initialNotes={(notesByPaintingId[notesPainting.id] ?? []).map(
            (n) => ({
              id: n.id,
              image_url: n.image_url,
              x: n.x,
              y: n.y,
              width: n.width,
              sort_order: n.sort_order,
            })
          )}
          onSaved={(notes) => onNotesSaved(notesPainting.id, notes)}
        />
      )}
    </section>
  );
}

function PaintingCanvasSection({
  pageId,
  heightRatio: initialRatio,
  initialItems,
  paintings,
}: {
  pageId: string;
  heightRatio: number;
  initialItems: CanvasRow[];
  paintings: PaintingWithImages[];
}) {
  const [items, setItems] = useState(() => rowsToItems(initialItems));
  const [heightRatio, setHeightRatio] = useState(initialRatio);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [linkPaintingId, setLinkPaintingId] = useState("");
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
      const painting = paintings.find((p) => p.id === linkPaintingId);
      const url =
        painting?.cover_image_url ||
        painting?.images[0]?.image_url ||
        publicUrl;
      setItems((prev) => [
        ...prev,
        {
          id: tempId,
          imageUrl: url,
          label: painting?.title || file.name,
          paintingId: linkPaintingId || null,
          meta: linkPaintingId ? { workId: linkPaintingId } : undefined,
          ...pos,
        },
      ]);
      setSelectedId(tempId);
      setMessage("Image added — save to persist.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function addPaintingToCanvas(paintingId: string) {
    const painting = paintings.find((p) => p.id === paintingId);
    const url =
      painting?.cover_image_url || painting?.images[0]?.image_url;
    if (!painting || !url) {
      setMessage("Painting needs at least one image first.");
      return;
    }
    const pos = defaultPositionForIndex(items.length);
    const tempId = `tmp-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        id: tempId,
        imageUrl: url,
        label: painting.title,
        paintingId: painting.id,
        meta: { workId: painting.id },
        ...pos,
      },
    ]);
    setSelectedId(tempId);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const supabase = createClient();

    const { error: pageError } = await supabase
      .from("canvas_pages")
      .update({ height_ratio: heightRatio })
      .eq("id", pageId);

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

    const nextItems: typeof items = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const paintingId =
        (item.meta?.workId as string | undefined) ||
        (item as { paintingId?: string | null }).paintingId ||
        null;
      const payload = {
        page_id: pageId,
        image_url: item.imageUrl,
        label: item.label ?? null,
        x: item.x,
        y: item.y,
        width: item.width,
        sort_order: i,
        painting_id: paintingId,
        work_id: null,
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
    setMessage("Canvas saved.");
  }

  return (
    <section className="space-y-4 border border-gray-200 p-4">
      <h2 className="font-medium">Free canvas (Design A)</h2>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save canvas"}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="border border-gray-300 px-3 py-2 text-sm"
        >
          {uploading ? "Uploading…" : "+ Upload image"}
        </button>
        <select
          className="border border-gray-300 px-3 py-2 text-sm"
          value={linkPaintingId}
          onChange={(e) => setLinkPaintingId(e.target.value)}
        >
          <option value="">Link upload to painting (optional)</option>
          {paintings.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <select
          className="border border-gray-300 px-3 py-2 text-sm"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) addPaintingToCanvas(e.target.value);
            e.target.value = "";
          }}
        >
          <option value="">Place existing painting…</option>
          {paintings.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
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
        {message && <span className="text-sm text-gray-600">{message}</span>}
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
    </section>
  );
}
