"use client";

import { useState } from "react";
import { createClient } from "@/core/supabase/client";
import type { TextEntry } from "@/lib/types";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function TextsAdmin({
  initialItems,
}: {
  initialItems: TextEntry[];
}) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    body: "",
    published_at: "",
  });
  const [message, setMessage] = useState("");

  async function addItem() {
    if (!form.title.trim() || !form.body.trim()) {
      setMessage("Title and full text required.");
      return;
    }
    const supabase = createClient();
    const baseSlug = slugify(form.title) || `text-${Date.now()}`;
    let slug = baseSlug;
    const existing = new Set(items.map((t) => t.slug));
    let n = 2;
    while (existing.has(slug)) {
      slug = `${baseSlug}-${n}`;
      n += 1;
    }
    const sortOrder =
      items.reduce((max, t) => Math.max(max, t.sort_order), 0) + 1;
    const { data, error } = await supabase
      .from("texts")
      .insert({
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim() || null,
        body: form.body.trim(),
        published_at: form.published_at || null,
        sort_order: sortOrder,
      })
      .select("id, title, slug, excerpt, body, published_at, sort_order")
      .single();
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems((prev) => [...prev, data as TextEntry]);
    setForm({ title: "", excerpt: "", body: "", published_at: "" });
    setMessage("Published.");
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("texts").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium">Texts</h1>
        <p className="mt-1 max-w-xl text-sm text-gray-600">
          Publish writings on the site: title, short text for the list, and full
          text for the detail page.
        </p>
      </div>

      <div className="space-y-3 border border-gray-200 p-4">
        <input
          className="w-full border border-gray-300 px-3 py-2 text-sm"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="min-h-20 w-full border border-gray-300 px-3 py-2 text-sm"
          placeholder="Short text (list excerpt)"
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
        />
        <textarea
          className="min-h-40 w-full border border-gray-300 px-3 py-2 text-sm"
          placeholder="Full text"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
        <input
          className="w-full border border-gray-300 px-3 py-2 text-sm"
          placeholder="Published date (YYYY-MM-DD) — optional"
          value={form.published_at}
          onChange={(e) => setForm({ ...form, published_at: e.target.value })}
        />
        <button
          type="button"
          onClick={() => void addItem()}
          className="bg-black px-4 py-2 text-sm text-white"
        >
          Publish text
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>

      <ul className="divide-y divide-gray-200 border border-gray-200">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-gray-500">/{item.slug}</p>
            </div>
            <button
              type="button"
              onClick={() => void remove(item.id)}
              className="text-sm text-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
