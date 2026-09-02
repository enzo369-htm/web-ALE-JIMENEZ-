import { createClient } from "@/core/supabase/server";
import TextsAdmin from "@/components/admin/TextsAdmin";
import type { TextEntry } from "@/lib/types";

export default async function AdminTextsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("texts")
    .select("id, title, slug, excerpt, body, published_at, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="space-y-2 text-sm">
        <h1 className="text-2xl font-medium">Texts</h1>
        <p className="text-red-600">{error.message}</p>
        <p className="text-gray-500">Run supabase/013_texts.sql</p>
      </div>
    );
  }

  return <TextsAdmin initialItems={(data as TextEntry[]) ?? []} />;
}
