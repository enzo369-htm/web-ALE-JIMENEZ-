import { createClient } from "@/core/supabase/server";
import AboutAdmin from "@/components/admin/AboutAdmin";
import type { SiteSettings } from "@/lib/types";

export default async function AdminAboutPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select(
      "id, studio_image_url, hero_left_image_url, hero_right_image_url, about_bio, about_photo_url, email, instagram, cv_url"
    )
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    return (
      <div className="space-y-2 text-sm">
        <h1 className="text-2xl font-medium">About</h1>
        <p className="text-red-600">{error.message}</p>
        <p className="text-gray-500">Run supabase/003_site_content.sql</p>
      </div>
    );
  }

  return <AboutAdmin initial={(data as SiteSettings) ?? null} />;
}
