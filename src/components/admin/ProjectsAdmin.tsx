"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/core/supabase/client";
import type { DisplayMode, Project } from "@/lib/types";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProjectsAdmin({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<DisplayMode>("a");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function createProject() {
    if (!title.trim()) return;
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const slug = slugify(title) || `project-${Date.now()}`;
    let canvasPageId: string | null = null;

    if (mode === "a") {
      const { data: page, error: pageError } = await supabase
        .from("canvas_pages")
        .insert({
          slug,
          title: `${title} canvas`,
          height_ratio: 1.15,
        })
        .select("id")
        .single();
      if (pageError) {
        setBusy(false);
        setMessage(pageError.message);
        return;
      }
      canvasPageId = page.id;
    }

    const sortOrder =
      projects.reduce((max, p) => Math.max(max, p.sort_order), 0) + 1;

    const { data, error } = await supabase
      .from("projects")
      .insert({
        slug,
        title: title.trim(),
        display_mode: mode,
        sort_order: sortOrder,
        canvas_page_id: canvasPageId,
        year: String(new Date().getFullYear()),
        description: "Project description placeholder.",
      })
      .select(
        "id, slug, title, year, location, description, display_mode, sort_order, canvas_page_id"
      )
      .single();

    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setProjects((prev) => [...prev, data as Project]);
    setTitle("");
    setMessage("Created.");
    router.push(`/admin/projects/${data.id}`);
    router.refresh();
  }

  async function removeProject(id: string) {
    if (!confirm("Delete this project and related works/notes?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium">Projects</h1>
        <p className="mt-1 text-sm text-gray-600">
          Mode A = free canvas. Mode B = centered work + handwritten notes.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 border border-gray-200 p-4">
        <label className="text-sm">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-56 border border-gray-300 px-3 py-2"
            placeholder="New project"
          />
        </label>
        <label className="text-sm">
          Mode
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as DisplayMode)}
            className="mt-1 block border border-gray-300 px-3 py-2"
          >
            <option value="a">A — Free composition</option>
            <option value="b">B — Studio wall</option>
          </select>
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => void createProject()}
          className="bg-black px-4 py-2.5 text-sm text-white disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create"}
        </button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>

      <ul className="divide-y divide-gray-200 border border-gray-200">
        {projects.length === 0 && (
          <li className="p-4 text-sm text-gray-500">No projects yet.</li>
        )}
        {projects.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 p-4"
          >
            <div>
              <Link
                href={`/admin/projects/${p.id}`}
                className="font-medium underline underline-offset-2"
              >
                {p.title}
              </Link>
              <p className="text-xs text-gray-500 mt-1">
                /{p.slug} · mode {p.display_mode.toUpperCase()}
                {p.year ? ` · ${p.year}` : ""}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link href={`/projects/${p.slug}`} className="text-gray-500 hover:text-black">
                View
              </Link>
              <button
                type="button"
                onClick={() => void removeProject(p.id)}
                className="text-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
