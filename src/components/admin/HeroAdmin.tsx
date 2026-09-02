"use client";

import { useState } from "react";
import { createClient } from "@/core/supabase/client";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { HeroLayout, SiteSettings } from "@/lib/types";

type FormState = {
  hero_layout: HeroLayout;
  hero_left_image_url: string;
  hero_right_image_url: string;
  hero_full_image_url: string;
};

function Slot({
  title,
  hint,
  prefix,
  value,
  onUploaded,
  onClear,
}: {
  title: string;
  hint: string;
  prefix: string;
  value: string;
  onUploaded: (url: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-2 border border-gray-200 p-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-gray-500">{hint}</p>
      </div>
      <ImageUploadField
        label="Upload"
        prefix={prefix}
        value={value || null}
        onUploaded={onUploaded}
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-red-600 underline"
        >
          Remove image
        </button>
      ) : null}
    </div>
  );
}

export default function HeroAdmin({
  initial,
}: {
  initial: SiteSettings | null;
}) {
  const [form, setForm] = useState<FormState>({
    hero_layout: initial?.hero_layout === "single" ? "single" : "dual",
    hero_left_image_url: initial?.hero_left_image_url ?? "",
    hero_right_image_url: initial?.hero_right_image_url ?? "",
    hero_full_image_url: initial?.hero_full_image_url ?? "",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.from("site_settings").upsert({
      id: 1,
      hero_layout: form.hero_layout,
      hero_left_image_url: form.hero_left_image_url || null,
      hero_right_image_url: form.hero_right_image_url || null,
      hero_full_image_url: form.hero_full_image_url || null,
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
        <h1 className="text-2xl font-medium">Hero</h1>
        <p className="mt-1 max-w-xl text-sm text-gray-600">
          Choose dual panels or one full-screen photo. You can keep all three
          images stored and switch layout anytime. Remove clears a slot.
        </p>
      </div>

      <div className="max-w-3xl space-y-6 border border-gray-200 p-4">
        <div>
          <p className="mb-2 text-sm font-medium">Layout</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "dual", label: "Two photos (left + right)" },
                { id: "single", label: "One full-screen photo" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setForm({ ...form, hero_layout: opt.id })}
                className={`border px-3 py-2 text-sm ${
                  form.hero_layout === opt.id
                    ? "border-black bg-black text-white"
                    : "border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Slot
            title="1. Left photo"
            hint="Used when layout is dual."
            prefix="hero/left"
            value={form.hero_left_image_url}
            onUploaded={(url) =>
              setForm({ ...form, hero_left_image_url: url })
            }
            onClear={() => setForm({ ...form, hero_left_image_url: "" })}
          />
          <Slot
            title="2. Right photo"
            hint="Used when layout is dual."
            prefix="hero/right"
            value={form.hero_right_image_url}
            onUploaded={(url) =>
              setForm({ ...form, hero_right_image_url: url })
            }
            onClear={() => setForm({ ...form, hero_right_image_url: "" })}
          />
        </div>

        <Slot
          title="3. Full-screen photo"
          hint="Horizontal / full viewport. Used when layout is single. object-cover, centered."
          prefix="hero/full"
          value={form.hero_full_image_url}
          onUploaded={(url) =>
            setForm({ ...form, hero_full_image_url: url, hero_layout: "single" })
          }
          onClear={() =>
            setForm({
              ...form,
              hero_full_image_url: "",
              hero_layout:
                form.hero_layout === "single" ? "dual" : form.hero_layout,
            })
          }
        />

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
