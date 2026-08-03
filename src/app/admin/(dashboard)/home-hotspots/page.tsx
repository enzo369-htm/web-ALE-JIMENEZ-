import { createClient } from "@/core/supabase/server";
import HomeHotspotsAdmin from "@/components/admin/HomeHotspotsAdmin";
import type { HomeHotspot, HomePanel } from "@/lib/home-hotspots";

export default async function AdminHomeHotspotsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_hotspots")
    .select("id, panel, label, href, object_note, points, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="space-y-3 text-sm">
        <h1 className="text-2xl font-medium">Home hotspots</h1>
        <p className="text-red-600">
          Could not load hotspots. Run{" "}
          <code className="text-xs">supabase/008_home_hotspots.sql</code> in the
          SQL editor, then refresh.
        </p>
        <p className="text-gray-500">{error.message}</p>
      </div>
    );
  }

  const initialItems: HomeHotspot[] = (data ?? []).map((row) => ({
    id: row.id,
    panel: row.panel as HomePanel,
    label: row.label,
    href: row.href,
    object: row.object_note ?? undefined,
    points: row.points,
    sort_order: row.sort_order,
  }));

  return <HomeHotspotsAdmin initialItems={initialItems} />;
}
