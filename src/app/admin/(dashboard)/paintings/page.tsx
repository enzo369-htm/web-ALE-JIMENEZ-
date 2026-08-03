import { createClient } from "@/core/supabase/server";
import PaintingsAdmin from "@/components/admin/PaintingsAdmin";
import type { Painting } from "@/lib/types";

export default async function AdminPaintingsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("paintings")
    .select("id, title, year, medium, image_url, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="space-y-2 text-sm">
        <h1 className="text-2xl font-medium">Paintings</h1>
        <p className="text-red-600">{error.message}</p>
        <p className="text-gray-500">Run supabase/007_paintings_texts_sounds.sql</p>
      </div>
    );
  }

  return <PaintingsAdmin initialItems={(data as Painting[]) ?? []} />;
}
