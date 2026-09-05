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
import TechSheetModal from "@/components/admin/TechSheetModal";
import type { Project, Work, WorkImage, WorkNote } from "@/lib/types";

const BUCKET = process.env.NEXT_PUBLIC_UPLOAD_BUCKET || "uploads";

type CanvasRow = {
  id: string;
  image_url: string;
  label: string | null;
  x: number;
  y: number;
  width: number;
  work_id: string | null;
};

type WorkWithImages = Work & { images: WorkImage[] };

function rowsToItems(rows: CanvasRow[]): (CanvasItem & { workId?: string | null })[] {
  return rows.map((r) => ({
    id: r.id,
    imageUrl: r.image_url,
    x: r.x,
    y: r.y,
    width: r.width,
    label: r.label ?? undefined,
    workId: r.work_id,
    meta: r.work_id ? { workId: r.work_id } : undefined,
  }));
}

function notesForWork(
  notesByWorkId: Record<string, WorkNote[]>,
  workId: string
): NoteRecord[] {
  return (notesByWorkId[workId] ?? []).map((n) => ({
    id: n.id,
    image_url: n.image_url,
    x: n.x,
    y: n.y,
    width: n.width,
    sort_order: n.sort_order,
  }));
}

export default function ProjectDetailAdmin({
  project: initialProject,
  works: initialWorks,
  canvasPage,
  canvasItems: initialCanvas,
  workNotes: initialWorkNotes,
}: {
  project: Project;
  works: WorkWithImages[];
  canvasPage: { id: string; height_ratio: number } | null;
  canvasItems: CanvasRow[];
  workNotes: WorkNote[];
}) {
  const [project, setProject] = useState(initialProject);
  const [works, setWorks] = useState(initialWorks);
  const [notesByWorkId, setNotesByWorkId] = useState<
    Record<string, WorkNote[]>
  >(() => {
    const map: Record<string, WorkNote[]> = {};
    for (const n of initialWorkNotes) {
      (map[n.work_id] ??= []).push(n);
    }
    return map;
  });
  const [message, setMessage] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

  async function saveMeta() {
    setSavingMeta(true);
    setMessage("");
    const supabase = createClient();
    let canvasPageId = project.canvas_page_id;

    if (!canvasPageId) {
      const { data: page, error } = await supabase
        .from("canvas_pages")
        .insert({
          slug: `project-${project.slug}-${project.id.slice(0, 8)}`,
          title: `${project.title} canvas`,
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
      .from("projects")
      .update({
        title: project.title,
        year: project.year,
        location: project.location,
        description: project.description,
        display_mode: "a",
        sort_order: project.sort_order,
        canvas_page_id: canvasPageId,
      })
      .eq("id", project.id);

    setSavingMeta(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setProject((p) => ({
      ...p,
      display_mode: "a",
      canvas_page_id: canvasPageId,
    }));
    setMessage("Project saved.");
  }

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/projects" className="text-sm text-gray-500 hover:text-black">
          ← Projects
        </Link>
        <h1 className="mt-2 text-2xl font-medium">{project.title}</h1>
        <p className="text-sm text-gray-500">/{project.slug}</p>
      </div>

      <section className="space-y-4 border border-gray-200 p-4">
        <h2 className="font-medium">Details</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Title
            <input
              className="mt-1 w-full border border-gray-300 px-3 py-2"
              value={project.title}
              onChange={(e) => setProject({ ...project, title: e.target.value })}
            />
          </label>
          <label className="text-sm">
            Year
            <input
              className="mt-1 w-full border border-gray-300 px-3 py-2"
              value={project.year ?? ""}
              onChange={(e) => setProject({ ...project, year: e.target.value })}
            />
          </label>
          <label className="text-sm">
            Location
            <input
              className="mt-1 w-full border border-gray-300 px-3 py-2"
              value={project.location ?? ""}
              onChange={(e) =>
                setProject({ ...project, location: e.target.value })
              }
            />
          </label>
          <label className="text-sm">
            Sort order
            <input
              type="number"
              className="mt-1 w-full border border-gray-300 px-3 py-2"
              value={project.sort_order}
              onChange={(e) =>
                setProject({
                  ...project,
                  sort_order: Number(e.target.value) || 0,
                })
              }
            />
          </label>
          <label className="text-sm sm:col-span-2">
            Description
            <textarea
              className="mt-1 min-h-24 w-full border border-gray-300 px-3 py-2"
              value={project.description ?? ""}
              onChange={(e) =>
                setProject({ ...project, description: e.target.value })
              }
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => void saveMeta()}
          disabled={savingMeta}
          className="bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {savingMeta ? "Saving…" : "Save details"}
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </section>

      <WorksSection
        projectId={project.id}
        works={works}
        onChange={setWorks}
        notesByWorkId={notesByWorkId}
        onNotesSaved={(workId, notes) => {
          setNotesByWorkId((prev) => ({
            ...prev,
            [workId]: notes.map((n) => ({ ...n, work_id: workId })),
          }));
        }}
      />

      {(canvasPage || project.canvas_page_id) && (
        <ProjectCanvasSection
          pageId={(canvasPage?.id || project.canvas_page_id)!}
          heightRatio={canvasPage?.height_ratio ?? 1.15}
          initialItems={initialCanvas}
          works={works}
        />
      )}
    </div>
  );
}

function WorksSection({
  projectId,
  works,
  onChange,
  notesByWorkId,
  onNotesSaved,
}: {
  projectId: string;
  works: WorkWithImages[];
  onChange: (works: WorkWithImages[]) => void;
  notesByWorkId: Record<string, WorkNote[]>;
  onNotesSaved: (workId: string, notes: NoteRecord[]) => void;
}) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [notesWorkId, setNotesWorkId] = useState<string | null>(null);
  const [techWorkId, setTechWorkId] = useState<string | null>(null);

  const notesWork = works.find((w) => w.id === notesWorkId) ?? null;
  const notesCenter =
    notesWork?.cover_image_url || notesWork?.images[0]?.image_url || null;
  const techWork = works.find((w) => w.id === techWorkId) ?? null;

  async function addWork() {
    if (!title.trim()) return;
    setBusy(true);
    const supabase = createClient();
    const sortOrder =
      works.reduce((max, w) => Math.max(max, w.sort_order), 0) + 1;
    const { data, error } = await supabase
      .from("works")
      .insert({
        project_id: projectId,
        title: title.trim(),
        year: String(new Date().getFullYear()),
        medium: "oil on canvas",
        sort_order: sortOrder,
      })
      .select(
        "id, project_id, title, year, medium, cover_image_url, tech_sheet_text, sort_order"
      )
      .single();
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    onChange([...works, { ...(data as Work), images: [] }]);
    setTitle("");
    setMsg("Work added.");
  }

  async function updateWork(work: WorkWithImages, patch: Partial<Work>) {
    const supabase = createClient();
    const next = { ...work, ...patch };
    const { error } = await supabase
      .from("works")
      .update({
        title: next.title,
        year: next.year,
        medium: next.medium,
        cover_image_url: next.cover_image_url,
      })
      .eq("id", work.id);
    if (error) {
      setMsg(error.message);
      return;
    }
    onChange(works.map((w) => (w.id === work.id ? next : w)));
  }

  async function addImage(work: WorkWithImages, url: string) {
    const supabase = createClient();
    const sortOrder = work.images.length;
    const { data, error } = await supabase
      .from("work_images")
      .insert({ work_id: work.id, image_url: url, sort_order: sortOrder })
      .select("id, work_id, image_url, sort_order")
      .single();
    if (error) {
      setMsg(error.message);
      return;
    }
    const images = [...work.images, data as WorkImage];
    const cover = work.cover_image_url || url;
    const { error: coverError } = await supabase
      .from("works")
      .update({ cover_image_url: cover })
      .eq("id", work.id);
    if (coverError) {
      setMsg(coverError.message);
      return;
    }
    onChange(
      works.map((w) =>
        w.id === work.id ? { ...w, images, cover_image_url: cover } : w
      )
    );
  }

  async function removeWork(id: string) {
    if (!confirm("Delete this work and its images?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("works").delete().eq("id", id);
    if (error) {
      setMsg(error.message);
      return;
    }
    onChange(works.filter((w) => w.id !== id));
  }

  return (
    <section className="space-y-4 border border-gray-200 p-4">
      <h2 className="font-medium">Works</h2>
      <p className="text-sm text-gray-600">
        Each work can have multiple photos (lightbox carousel). Use{" "}
        <strong>Cargar notas</strong> for studio notes and{" "}
        <strong>Cargar ficha técnica</strong> for the sheet under the painting —
        both only show when the visitor opens that work full-screen.
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Work title"
          className="border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void addWork()}
          className="border border-gray-300 px-3 py-2 text-sm"
        >
          Add work
        </button>
      </div>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
      <ul className="space-y-6">
        {works.map((work) => (
          <li key={work.id} className="space-y-3 border-t border-gray-100 pt-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                className="border border-gray-300 px-3 py-2 text-sm"
                value={work.title}
                onChange={(e) =>
                  onChange(
                    works.map((w) =>
                      w.id === work.id ? { ...w, title: e.target.value } : w
                    )
                  )
                }
                onBlur={() => void updateWork(work, { title: work.title })}
              />
              <input
                className="border border-gray-300 px-3 py-2 text-sm"
                value={work.year ?? ""}
                placeholder="Year"
                onChange={(e) =>
                  onChange(
                    works.map((w) =>
                      w.id === work.id ? { ...w, year: e.target.value } : w
                    )
                  )
                }
                onBlur={() => void updateWork(work, { year: work.year })}
              />
              <input
                className="border border-gray-300 px-3 py-2 text-sm"
                value={work.medium ?? ""}
                placeholder="Medium"
                onChange={(e) =>
                  onChange(
                    works.map((w) =>
                      w.id === work.id ? { ...w, medium: e.target.value } : w
                    )
                  )
                }
                onBlur={() => void updateWork(work, { medium: work.medium })}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {work.images.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.image_url}
                  alt=""
                  className="h-20 w-auto border border-gray-200"
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ImageUploadField
                label="+ Photo"
                prefix={`works/${work.id}`}
                onUploaded={(url) => void addImage(work, url)}
              />
              <button
                type="button"
                onClick={() => setNotesWorkId(work.id)}
                className="border border-gray-300 px-3 py-2 text-sm"
              >
                Cargar notas
                {(notesByWorkId[work.id]?.length ?? 0) > 0
                  ? ` (${notesByWorkId[work.id].length})`
                  : ""}
              </button>
              <button
                type="button"
                onClick={() => setTechWorkId(work.id)}
                className="border border-gray-300 px-3 py-2 text-sm"
              >
                Cargar ficha técnica
                {work.tech_sheet_text ? " ✓" : ""}
              </button>
              <button
                type="button"
                onClick={() => void removeWork(work.id)}
                className="text-sm text-red-600"
              >
                Delete work
              </button>
            </div>
          </li>
        ))}
      </ul>

      {notesWork && (
        <NotesEditorModal
          open
          onClose={() => setNotesWorkId(null)}
          title={notesWork.title}
          centerImageUrl={notesCenter}
          uploadPrefix={`work-notes/${notesWork.id}`}
          table="work_notes"
          foreignKey="work_id"
          entityId={notesWork.id}
          initialNotes={notesForWork(notesByWorkId, notesWork.id)}
          onSaved={(notes) => onNotesSaved(notesWork.id, notes)}
        />
      )}

      {techWork && (
        <TechSheetModal
          open
          onClose={() => setTechWorkId(null)}
          title={techWork.title}
          table="works"
          entityId={techWork.id}
          initialText={techWork.tech_sheet_text}
          onSaved={(text) => {
            onChange(
              works.map((w) =>
                w.id === techWork.id ? { ...w, tech_sheet_text: text } : w
              )
            );
          }}
        />
      )}
    </section>
  );
}

function ProjectCanvasSection({
  pageId,
  heightRatio: initialRatio,
  initialItems,
  works,
}: {
  pageId: string;
  heightRatio: number;
  initialItems: CanvasRow[];
  works: WorkWithImages[];
}) {
  const [items, setItems] = useState(() => rowsToItems(initialItems));
  const [heightRatio, setHeightRatio] = useState(initialRatio);
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
          workId: null,
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

  function addWorkToCanvas(workId: string) {
    const work = works.find((w) => w.id === workId);
    const url = work?.cover_image_url || work?.images[0]?.image_url;
    if (!work || !url) {
      setMessage("Work needs at least one image first.");
      return;
    }
    const pos = defaultPositionForIndex(items.length);
    const tempId = `tmp-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        id: tempId,
        imageUrl: url,
        label: work.title,
        workId: work.id,
        meta: { workId: work.id },
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

    const nextItems: typeof items = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const workId =
        (item.meta?.workId as string | undefined) ||
        (item as { workId?: string | null }).workId ||
        null;
      const payload = {
        page_id: pageId,
        image_url: item.imageUrl,
        label: item.label ?? null,
        x: item.x,
        y: item.y,
        width: item.width,
        sort_order: i,
        work_id: workId,
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

    if (removed.length) {
      const { error: delError } = await supabase
        .from("canvas_items")
        .delete()
        .in("id", removed);
      if (delError) {
        setSaving(false);
        setMessage(delError.message);
        return;
      }
    }

    setItems(nextItems);
    knownIds.current = new Set(nextItems.map((i) => i.id));
    setSaving(false);
    setMessage("Canvas saved.");
  }

  return (
    <section className="space-y-4 border border-gray-200 p-4">
      <h2 className="font-medium">Free canvas</h2>
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
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) addWorkToCanvas(e.target.value);
            e.target.value = "";
          }}
        >
          <option value="">Place work on canvas…</option>
          {works.map((w) => (
            <option key={w.id} value={w.id}>
              {w.title}
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
