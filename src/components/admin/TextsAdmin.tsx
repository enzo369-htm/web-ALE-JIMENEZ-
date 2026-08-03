"use client";

import { useState } from "react";
import { createClient } from "@/core/supabase/client";
import type { TextEntry } from "@/lib/types";

export default function TextsAdmin({
  initialItems,
}: {
  initialItems: TextEntry[];
}) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    substack_url: "https://substack.com",
    embed_html: "",
    published_at: "",
  });
  const [message, setMessage] = useState("");

  async function addItem() {
    if (!form.title.trim() || !form.substack_url.trim()) {
      setMessage("Title and Substack URL required.");
      return;
    }
    const supabase = createClient();
    const sortOrder =
      items.reduce((max, t) => Math.max(max, t.sort_order), 0) + 1;
    const { data, error } = await supabase
      .from("texts")
      .insert({
        title: form.title.trim(),
        excerpt: form.excerpt || null,
        substack_url: form.substack_url.trim(),
        embed_html: form.embed_html || null,
        published_at: form.published_at || null,
        sort_order: sortOrder,
      })
      .select(
        "id, title, excerpt, substack_url, embed_html, published_at, sort_order"
      )
      .single();
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems((prev) => [...prev, data as TextEntry]);
    setForm({
      title: "",
      excerpt: "",
      substack_url: "https://substack.com",
      embed_html: "",
      published_at: "",
    });
    setMessage("Added.");
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
        <p className="mt-1 text-sm text-gray-600 max-w-xl">
          Store title + excerpt + Substack URL. Optional: paste Substack embed
          iframe HTML for an in-page preview.
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
          className="w-full border border-gray-300 px-3 py-2 text-sm min-h-20"
          placeholder="Excerpt"
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
        />
        <input
          className="w-full border border-gray-300 px-3 py-2 text-sm"
          placeholder="Substack URL"
          value={form.substack_url}
          onChange={(e) => setForm({ ...form, substack_url: e.target.value })}
        />
        <input
          className="w-full border border-gray-300 px-3 py-2 text-sm"
          placeholder="Published date (YYYY-MM-DD)"
          value={form.published_at}
          onChange={(e) => setForm({ ...form, published_at: e.target.value })}
        />
        <textarea
          className="w-full border border-gray-300 px-3 py-2 text-sm min-h-20 font-mono text-xs"
          placeholder="Optional embed HTML (iframe)"
          value={form.embed_html}
          onChange={(e) => setForm({ ...form, embed_html: e.target.value })}
        />
        <button
          type="button"
          onClick={() => void addItem()}
          className="bg-black px-4 py-2 text-sm text-white"
        >
          Add text
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>

      <ul className="divide-y divide-gray-200 border border-gray-200">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{item.title}</p>
              <a
                href={item.substack_url}
                className="text-xs text-gray-500 underline"
                target="_blank"
                rel="noreferrer"
              >
                {item.substack_url}
              </a>
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
