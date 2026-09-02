import { createClient } from "@/core/supabase/server";
import HeroAdmin from "@/components/admin/HeroAdmin";
import type { SiteSettings } from "@/lib/types";

export default async function AdminHeroPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select(
      "id, studio_image_url, hero_layout, hero_left_image_url, hero_right_image_url, hero_full_image_url, about_bio, about_photo_url, email, instagram"
    )
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    return (
      <div className="space-y-2 text-sm">
        <h1 className="text-2xl font-medium">Hero</h1>
        <p className="text-red-600">{error.message}</p>
        <p className="text-gray-500">
          Run supabase/003_site_content.sql, 011_hero_images.sql and
          012_hero_full_layout.sql
        </p>
      </div>
    );
  }

  return <HeroAdmin initial={(data as SiteSettings) ?? null} />;
}
