"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/core/supabase/client";
import type { PaintingYear } from "@/lib/types";

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function PaintingsAdmin({
  initialYears,
}: {
  initialYears: PaintingYear[];
}) {
  const router = useRouter();
  const [years, setYears] = useState(initialYears);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function createYear() {
    if (!title.trim()) return;
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const baseSlug = slugify(title) || `year-${Date.now()}`;
    let slug = baseSlug;
    const existing = new Set(years.map((y) => y.slug));
    let n = 2;
    while (existing.has(slug)) {
      slug = `${baseSlug}-${n}`;
      n += 1;
    }

    const { data: page, error: pageError } = await supabase
      .from("canvas_pages")
      .insert({
        slug: `paintings-${slug}-${Date.now().toString(36).slice(-6)}`,
        title: `${title.trim()} canvas`,
        height_ratio: 1.15,
      })
      .select("id")
      .single();

    if (pageError) {
      setBusy(false);
      setMessage(pageError.message);
      return;
    }

    const sortOrder =
      years.reduce((max, y) => Math.max(max, y.sort_order), 0) + 1;

    const { data, error } = await supabase
      .from("painting_years")
      .insert({
        title: title.trim(),
        slug,
        year: title.trim(),
        description: null,
        sort_order: sortOrder,
        canvas_page_id: page.id,
      })
      .select(
        "id, title, slug, year, description, sort_order, canvas_page_id"
      )
      .single();

    if (error) {
      await supabase.from("canvas_pages").delete().eq("id", page.id);
      setBusy(false);
      setMessage(error.message);
      return;
    }

    setBusy(false);
    setYears((prev) => [...prev, data as PaintingYear]);
    setTitle("");
    setMessage("Created.");
    router.push(`/admin/paintings/${data.id}`);
    router.refresh();
  }

  async function removeYear(id: string) {
    if (!confirm("Delete this year group, canvas, and all its paintings?"))
      return;
    const supabase = createClient();
    const year = years.find((y) => y.id === id);
    const { error } = await supabase.from("painting_years").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (year?.canvas_page_id) {
      const { error: pageError } = await supabase
        .from("canvas_pages")
        .delete()
        .eq("id", year.canvas_page_id);
      if (pageError) {
        setMessage(
          `Year deleted, but canvas cleanup failed: ${pageError.message}`
        );
      }
    }
    setYears((prev) => prev.filter((y) => y.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium">Selected paintings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Same as Projects Design A: create a year group, add paintings, place
          them on the free canvas.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 border border-gray-200 p-4">
        <label className="text-sm">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-56 border border-gray-300 px-3 py-2"
            placeholder="2025"
          />
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => void createYear()}
          className="bg-black px-4 py-2.5 text-sm text-white disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create"}
        </button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>

      <ul className="divide-y divide-gray-200 border border-gray-200">
        {years.length === 0 && (
          <li className="p-4 text-sm text-gray-500">No year groups yet.</li>
        )}
        {years.map((y) => (
          <li
            key={y.id}
            className="flex flex-wrap items-center justify-between gap-3 p-4"
          >
            <div>
              <Link
                href={`/admin/paintings/${y.id}`}
                className="font-medium underline underline-offset-2"
              >
                {y.title}
              </Link>
              <p className="mt-1 text-xs text-gray-500">
                /{y.slug}
                {y.year ? ` · ${y.year}` : ""}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link
                href={`/paintings/${y.slug}`}
                className="text-gray-500 hover:text-black"
              >
                View
              </Link>
              <button
                type="button"
                onClick={() => void removeYear(y.id)}
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
