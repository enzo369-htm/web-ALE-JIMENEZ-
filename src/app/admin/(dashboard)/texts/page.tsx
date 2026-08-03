import { createClient } from "@/core/supabase/server";
import TextsAdmin from "@/components/admin/TextsAdmin";
import type { TextEntry } from "@/lib/types";

export default async function AdminTextsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("texts")
    .select(
      "id, title, excerpt, substack_url, embed_html, published_at, sort_order"
    )
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="space-y-2 text-sm">
        <h1 className="text-2xl font-medium">Texts</h1>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  return <TextsAdmin initialItems={(data as TextEntry[]) ?? []} />;
}
