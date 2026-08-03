import Link from "next/link";
import { createClient } from "@/core/supabase/server";
import CanvasAdmin from "@/components/CanvasAdmin";

export default async function AdminCanvasPage() {
  const supabase = await createClient();

  const { data: page, error: pageError } = await supabase
    .from("canvas_pages")
    .select("id, height_ratio")
    .eq("slug", "demo")
    .maybeSingle();

  if (pageError || !page) {
    return (
      <div className="space-y-3 text-sm">
        <h1 className="text-2xl font-medium">Canvas</h1>
        <p className="text-red-600">
          Missing demo page. Run{" "}
          <code className="text-xs">supabase/002_free_canvas_items.sql</code>{" "}
          in your Supabase SQL editor, then refresh.
        </p>
        {pageError && (
          <p className="text-gray-500">{pageError.message}</p>
        )}
      </div>
    );
  }

  const { data: rows } = await supabase
    .from("canvas_items")
    .select("id, image_url, label, x, y, width")
    .eq("page_id", page.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-medium">Canvas demo</h1>
      <p className="text-sm text-gray-600">
        Kit demo page (<code className="text-xs">slug=demo</code>). Real project
        canvases live under{" "}
        <Link href="/admin/projects" className="underline">
          Projects
        </Link>
        .
      </p>
      <CanvasAdmin page={page} initialItems={rows ?? []} />
    </div>
  );
}
