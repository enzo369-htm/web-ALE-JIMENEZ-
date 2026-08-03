"use client";

import { useState } from "react";
import { createClient } from "@/core/supabase/client";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { SiteSettings } from "@/lib/types";

export default function AboutAdmin({
  initial,
}: {
  initial: SiteSettings | null;
}) {
  const [form, setForm] = useState({
    about_bio: initial?.about_bio ?? "",
    about_photo_url: initial?.about_photo_url ?? "",
    studio_image_url: initial?.studio_image_url ?? "",
    email: initial?.email ?? "",
    instagram: initial?.instagram ?? "",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.from("site_settings").upsert({
      id: 1,
      about_bio: form.about_bio || null,
      about_photo_url: form.about_photo_url || null,
      studio_image_url: form.studio_image_url || null,
      email: form.email || null,
      instagram: form.instagram || null,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Saved.");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium">About / Home</h1>
        <p className="mt-1 text-sm text-gray-600 max-w-xl">
          Bio, contact, portrait, and the studio photograph used as the
          interactive home background.
        </p>
      </div>

      <div className="space-y-4 border border-gray-200 p-4 max-w-2xl">
        <label className="block text-sm">
          Bio
          <textarea
            className="mt-1 w-full border border-gray-300 px-3 py-2 min-h-32"
            value={form.about_bio}
            onChange={(e) => setForm({ ...form, about_bio: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Email
          <input
            className="mt-1 w-full border border-gray-300 px-3 py-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Instagram URL
          <input
            className="mt-1 w-full border border-gray-300 px-3 py-2"
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
          />
        </label>

        <div>
          <p className="text-sm mb-2">About portrait</p>
          <ImageUploadField
            prefix="about"
            value={form.about_photo_url}
            onUploaded={(url) => setForm({ ...form, about_photo_url: url })}
          />
        </div>

        <div>
          <p className="text-sm mb-2">Home studio image</p>
          <ImageUploadField
            prefix="home"
            value={form.studio_image_url}
            onUploaded={(url) => setForm({ ...form, studio_image_url: url })}
          />
        </div>

        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
