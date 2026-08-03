import { createClient } from "@/core/supabase/server";
import StudioHome from "@/components/StudioHome";

export default async function HomePage() {
  let studioImageUrl: string | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("studio_image_url")
      .eq("id", 1)
      .maybeSingle();
    studioImageUrl = data?.studio_image_url ?? null;
  } catch {
    studioImageUrl = null;
  }

  return <StudioHome studioImageUrl={studioImageUrl} />;
}
