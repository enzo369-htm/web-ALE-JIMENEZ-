"use client";

import { useState } from "react";
import { createClient } from "@/core/supabase/client";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { Painting } from "@/lib/types";

export default function PaintingsAdmin({
  initialItems,
}: {
  initialItems: Painting[];
}) {
  const [items, setItems] = useState(initialItems);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [medium, setMedium] = useState("oil on canvas");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");

  async function addItem() {
    if (!title.trim() || !imageUrl) {
      setMessage("Title and image required.");
      return;
    }
    const supabase = createClient();
    const sortOrder =
      items.reduce((max, p) => Math.max(max, p.sort_order), 0) + 1;
    const { data, error } = await supabase
      .from("paintings")
      .insert({
        title: title.trim(),
        year: year || null,
        medium: medium || null,
        image_url: imageUrl,
        sort_order: sortOrder,
      })
      .select("id, title, year, medium, image_url, sort_order")
      .single();
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems((prev) => [...prev, data as Painting]);
    setTitle("");
    setImageUrl("");
    setMessage("Added.");
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("paintings").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium">Selected paintings</h1>
        <p className="mt-1 text-sm text-gray-600">Simple public gallery.</p>
      </div>

      <div className="space-y-3 border border-gray-200 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            className="border border-gray-300 px-3 py-2 text-sm"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="border border-gray-300 px-3 py-2 text-sm"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <input
            className="border border-gray-300 px-3 py-2 text-sm"
            placeholder="Medium"
            value={medium}
            onChange={(e) => setMedium(e.target.value)}
          />
        </div>
        <ImageUploadField
          prefix="paintings"
          value={imageUrl}
          onUploaded={setImageUrl}
        />
        <button
          type="button"
          onClick={() => void addItem()}
          className="bg-black px-4 py-2 text-sm text-white"
        >
          Add painting
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>

      <ul className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="border border-gray-200 p-3 space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image_url} alt={item.title} className="w-full h-auto" />
            <p className="text-sm font-medium">{item.title}</p>
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
