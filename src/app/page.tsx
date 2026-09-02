import { createClient } from "@/core/supabase/server";
import StudioHome from "@/components/StudioHome";
import type { HeroLayout } from "@/lib/types";

export default async function HomePage() {
  let layout: HeroLayout = "dual";
  let leftSrc: string | null = null;
  let rightSrc: string | null = null;
  let fullSrc: string | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select(
        "hero_layout, hero_left_image_url, hero_right_image_url, hero_full_image_url"
      )
      .eq("id", 1)
      .maybeSingle();
    layout = data?.hero_layout === "single" ? "single" : "dual";
    leftSrc = data?.hero_left_image_url ?? null;
    rightSrc = data?.hero_right_image_url ?? null;
    fullSrc = data?.hero_full_image_url ?? null;
  } catch {
    // fall back to static dual panels in StudioHome
  }

  return (
    <StudioHome
      layout={layout}
      leftSrc={leftSrc}
      rightSrc={rightSrc}
      fullSrc={fullSrc}
    />
  );
}
