"use client";

import { useState } from "react";
import { createClient } from "@/core/supabase/client";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { SoundTrack } from "@/lib/types";

export default function SoundsAdmin({
  initialItems,
}: {
  initialItems: SoundTrack[];
}) {
  const [items, setItems] = useState(initialItems);
  const [title, setTitle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [message, setMessage] = useState("");

  async function addItem() {
    if (!title.trim() || !audioUrl) {
      setMessage("Title and audio required.");
      return;
    }
    const supabase = createClient();
    const sortOrder =
      items.reduce((max, s) => Math.max(max, s.sort_order), 0) + 1;
    const { data, error } = await supabase
      .from("sounds")
      .insert({
        title: title.trim(),
        audio_url: audioUrl,
        sort_order: sortOrder,
      })
      .select("id, title, audio_url, cover_image_url, sort_order")
      .single();
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems((prev) => [...prev, data as SoundTrack]);
    setTitle("");
    setAudioUrl("");
    setMessage("Added.");
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("sounds").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium">Sounds</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload audio files to Supabase Storage (mp3/wav recommended).
        </p>
      </div>

      <div className="space-y-3 border border-gray-200 p-4">
        <input
          className="w-full border border-gray-300 px-3 py-2 text-sm"
          placeholder="Track title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <ImageUploadField
          label="Upload audio"
          prefix="sounds"
          accept="audio/*"
          downscale={false}
          value={audioUrl}
          onUploaded={setAudioUrl}
        />
        <button
          type="button"
          onClick={() => void addItem()}
          className="bg-black px-4 py-2 text-sm text-white"
        >
          Add sound
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>

      <ul className="divide-y divide-gray-200 border border-gray-200">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-gray-500 break-all">{item.audio_url}</p>
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
