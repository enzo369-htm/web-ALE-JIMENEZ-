import { createClient } from "@/core/supabase/server";
import PaintingsAdmin from "@/components/admin/PaintingsAdmin";
import type { PaintingYear } from "@/lib/types";

export default async function AdminPaintingsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("painting_years")
    .select("id, title, slug, year, description, sort_order, canvas_page_id")
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="space-y-2 text-sm">
        <h1 className="text-2xl font-medium">Paintings</h1>
        <p className="text-red-600">{error.message}</p>
        <p className="text-gray-500">
          Run supabase/014_painting_years.sql and
          supabase/015_painting_years_canvas.sql
        </p>
      </div>
    );
  }

  return <PaintingsAdmin initialYears={(data as PaintingYear[]) ?? []} />;
}
