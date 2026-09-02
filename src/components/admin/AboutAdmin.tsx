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
        <h1 className="text-2xl font-medium">About</h1>
        <p className="mt-1 max-w-xl text-sm text-gray-600">
          Bio, contact, and portrait for the About page.
        </p>
      </div>

      <div className="max-w-2xl space-y-4 border border-gray-200 p-4">
        <label className="block text-sm">
          Bio
          <textarea
            className="mt-1 min-h-32 w-full border border-gray-300 px-3 py-2"
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
          <p className="mb-2 text-sm">About portrait</p>
          <ImageUploadField
            prefix="about"
            value={form.about_photo_url}
            onUploaded={(url) => setForm({ ...form, about_photo_url: url })}
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
