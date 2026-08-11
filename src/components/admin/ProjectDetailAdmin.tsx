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
import type { DisplayMode, Project, ProjectNote, Work, WorkImage } from "@/lib/types";

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

export default function ProjectDetailAdmin({
  project: initialProject,
  works: initialWorks,
  canvasPage,
  canvasItems: initialCanvas,
  notes: initialNotes,
}: {
  project: Project;
  works: WorkWithImages[];
  canvasPage: { id: string; height_ratio: number } | null;
  canvasItems: CanvasRow[];
  notes: ProjectNote[];
}) {
  const [project, setProject] = useState(initialProject);
  const [works, setWorks] = useState(initialWorks);
  const [message, setMessage] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

  async function saveMeta() {
    setSavingMeta(true);
    setMessage("");
    const supabase = createClient();
    let canvasPageId = project.canvas_page_id;

    if (project.display_mode === "a" && !canvasPageId) {
      const { data: page, error } = await supabase
        .from("canvas_pages")
        .insert({
          slug: project.slug,
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
        display_mode: project.display_mode,
        sort_order: project.sort_order,
        canvas_page_id: canvasPageId,
      })
      .eq("id", project.id);

    setSavingMeta(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setProject((p) => ({ ...p, canvas_page_id: canvasPageId }));
    setMessage("Project saved. Refresh if you switched modes.");
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
            Display mode
            <select
              className="mt-1 w-full border border-gray-300 px-3 py-2"
              value={project.display_mode}
              onChange={(e) =>
                setProject({
                  ...project,
                  display_mode: e.target.value as DisplayMode,
                })
              }
            >
              <option value="a">A — Free composition</option>
              <option value="b">B — Studio wall</option>
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            Description
            <textarea
              className="mt-1 w-full border border-gray-300 px-3 py-2 min-h-24"
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
      />

      {project.display_mode === "a" && (canvasPage || project.canvas_page_id) && (
        <ProjectCanvasSection
          pageId={(canvasPage?.id || project.canvas_page_id)!}
          heightRatio={canvasPage?.height_ratio ?? 1.15}
          initialItems={initialCanvas}
          works={works}
        />
      )}

      {project.display_mode === "b" && (
        <ProjectNotesSection
          projectId={project.id}
          initialNotes={initialNotes}
        />
      )}
    </div>
  );
}

function WorksSection({
  projectId,
  works,
  onChange,
}: {
  projectId: string;
  works: WorkWithImages[];
  onChange: (works: WorkWithImages[]) => void;
}) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

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
      .select("id, project_id, title, year, medium, cover_image_url, sort_order")
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
    await supabase
      .from("works")
      .update({ cover_image_url: cover })
      .eq("id", work.id);
    onChange(
      works.map((w) =>
        w.id === work.id
          ? { ...w, images, cover_image_url: cover }
          : w
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
      <h2 className="font-medium">Works (carousel source)</h2>
      <p className="text-sm text-gray-600">
        Each work can have multiple photos. Opening a work on the public site
        shows them as a horizontal carousel.
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
          <li key={work.id} className="border-t border-gray-100 pt-4 space-y-3">
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
                onClick={() => void removeWork(work.id)}
                className="text-sm text-red-600"
              >
                Delete work
              </button>
            </div>
          </li>
        ))}
      </ul>
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
  const [linkWorkId, setLinkWorkId] = useState("");
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
      const work = works.find((w) => w.id === linkWorkId);
      setItems((prev) => [
        ...prev,
        {
          id: tempId,
          imageUrl: work?.cover_image_url || publicUrl,
          label: work?.title || file.name,
          workId: linkWorkId || null,
          meta: linkWorkId ? { workId: linkWorkId } : undefined,
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
    if (!work?.cover_image_url && work?.images[0]) {
      // use first image
    }
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
    if (removed.length) {
      await supabase.from("canvas_items").delete().in("id", removed);
    }

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

    setItems(nextItems);
    knownIds.current = new Set(nextItems.map((i) => i.id));
    setSaving(false);
    setMessage("Canvas saved.");
  }

  return (
    <section className="space-y-4 border border-gray-200 p-4">
      <h2 className="font-medium">Design A — Free canvas</h2>
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
          value={linkWorkId}
          onChange={(e) => setLinkWorkId(e.target.value)}
        >
          <option value="">Link upload to work (optional)</option>
          {works.map((w) => (
            <option key={w.id} value={w.id}>
              {w.title}
            </option>
          ))}
        </select>
        <select
          className="border border-gray-300 px-3 py-2 text-sm"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) addWorkToCanvas(e.target.value);
            e.target.value = "";
          }}
        >
          <option value="">Place existing work…</option>
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

function ProjectNotesSection({
  projectId,
  initialNotes,
}: {
  projectId: string;
  initialNotes: ProjectNote[];
}) {
  const [items, setItems] = useState<CanvasItem[]>(() =>
    initialNotes.map((n) => ({
      id: n.id,
      imageUrl: n.image_url,
      x: n.x,
      y: n.y,
      width: n.width,
      label: "note",
    }))
  );
  const [heightRatio, setHeightRatio] = useState(1.05);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const knownIds = useRef(new Set(initialNotes.map((n) => n.id)));
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleAdd(file: File) {
    try {
      const supabase = createClient();
      const path = buildUploadPath(`notes/${projectId}`, file.name);
      const { publicUrl } = await uploadFile({
        supabase,
        bucket: BUCKET,
        path,
        file,
        // Keep PNG alpha — downscale converts to JPEG and destroys transparency
        downscale: false,
      });
      const pos = defaultPositionForIndex(items.length);
      const tempId = `tmp-${Date.now()}`;
      setItems((prev) => [
        ...prev,
        { id: tempId, imageUrl: publicUrl, label: "note", ...pos },
      ]);
      setSelectedId(tempId);
      setMessage("Note added — save to persist. Prefer PNG scans with clean edges.");
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
    if (removed.length) {
      await supabase.from("project_notes").delete().in("id", removed);
    }

    const next: CanvasItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const payload = {
        project_id: projectId,
        image_url: item.imageUrl,
        x: item.x,
        y: item.y,
        width: item.width,
        sort_order: i,
      };
      if (item.id.startsWith("tmp-") || !knownIds.current.has(item.id)) {
        const { data, error } = await supabase
          .from("project_notes")
          .insert(payload)
          .select("id")
          .single();
        if (error) {
          setSaving(false);
          setMessage(error.message);
          return;
        }
        next.push({ ...item, id: data.id });
      } else {
        const { error } = await supabase
          .from("project_notes")
          .update(payload)
          .eq("id", item.id);
        if (error) {
          setSaving(false);
          setMessage(error.message);
          return;
        }
        next.push(item);
      }
    }
    setItems(next);
    knownIds.current = new Set(next.map((i) => i.id));
    setSaving(false);
    setMessage("Notes saved.");
  }

  return (
    <section className="space-y-4 border border-gray-200 p-4">
      <h2 className="font-medium">Design B — Studio notes</h2>
      <p className="text-sm text-gray-600 max-w-2xl">
        Upload photographed or scanned handwritten notes. Use a real transparent
        PNG (no checkerboard in the file). Position them around the centered work
        on the public page.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save notes"}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="border border-gray-300 px-3 py-2 text-sm"
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
        {message && <span className="text-sm text-gray-600">{message}</span>}
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
