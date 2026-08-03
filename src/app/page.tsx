import { createClient } from "@/core/supabase/server";
import StudioHome from "@/components/StudioHome";
import {
  HOME_HOTSPOTS,
  type HomeHotspot,
  type HomePanel,
} from "@/lib/home-hotspots";

export default async function HomePage() {
  let hotspots: HomeHotspot[] = HOME_HOTSPOTS;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("home_hotspots")
      .select("id, panel, label, href, object_note, points, sort_order")
      .order("sort_order", { ascending: true });

    if (data && data.length > 0) {
      hotspots = data.map((row) => ({
        id: row.id,
        panel: row.panel as HomePanel,
        label: row.label,
        href: row.href,
        object: row.object_note ?? undefined,
        points: row.points,
        sort_order: row.sort_order,
      }));
    }
  } catch {
    hotspots = HOME_HOTSPOTS;
  }

  return <StudioHome hotspots={hotspots} />;
}
