import { notFound } from "next/navigation";
import { createClient } from "@/core/supabase/server";
import PaintingYearDetailAdmin from "@/components/admin/PaintingYearDetailAdmin";
import type {
  Painting,
  PaintingImage,
  PaintingNote,
  PaintingYear,
} from "@/lib/types";

type Params = { id: string };

export default async function AdminPaintingYearPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: yearGroup, error } = await supabase
    .from("painting_years")
    .select("id, title, slug, year, description, sort_order, canvas_page_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !yearGroup) notFound();

  let year = yearGroup as PaintingYear;

  // Ensure free canvas always exists (older year groups may lack canvas_page_id).
  if (!year.canvas_page_id) {
    const { data: page, error: pageError } = await supabase
      .from("canvas_pages")
      .insert({
        slug: `paintings-${year.slug}-${year.id.slice(0, 8)}`,
        title: `${year.title} canvas`,
        height_ratio: 1.15,
      })
      .select("id, height_ratio")
      .single();

    if (!pageError && page) {
      await supabase
        .from("painting_years")
        .update({ canvas_page_id: page.id })
        .eq("id", year.id);
      year = { ...year, canvas_page_id: page.id };
    }
  }

  const { data: paintingRows } = await supabase
    .from("paintings")
    .select(
      "id, year_id, title, year, medium, image_url, cover_image_url, sort_order"
    )
    .eq("year_id", id)
    .order("sort_order", { ascending: true });

  const rows = (paintingRows as Painting[]) ?? [];
  const paintingIds = rows.map((p) => p.id);

  let images: PaintingImage[] = [];
  let paintingNotes: PaintingNote[] = [];
  if (paintingIds.length) {
    const { data } = await supabase
      .from("painting_images")
      .select("id, painting_id, image_url, sort_order")
      .in("painting_id", paintingIds)
      .order("sort_order", { ascending: true });
    images = (data as PaintingImage[]) ?? [];

    const { data: notes } = await supabase
      .from("painting_notes")
      .select("id, painting_id, image_url, x, y, width, sort_order")
      .in("painting_id", paintingIds)
      .order("sort_order", { ascending: true });
    paintingNotes = (notes as PaintingNote[]) ?? [];
  }

  const paintings = rows.map((p) => ({
    ...p,
    images: images.filter((img) => img.painting_id === p.id),
  }));

  let canvasPage: { id: string; height_ratio: number } | null = null;
  let canvasItems: {
    id: string;
    image_url: string;
    label: string | null;
    x: number;
    y: number;
    width: number;
    painting_id: string | null;
  }[] = [];

  if (year.canvas_page_id) {
    const { data: page } = await supabase
      .from("canvas_pages")
      .select("id, height_ratio")
      .eq("id", year.canvas_page_id)
      .maybeSingle();
    canvasPage = page;
    if (page) {
      const { data: canvasRows } = await supabase
        .from("canvas_items")
        .select("id, image_url, label, x, y, width, painting_id")
        .eq("page_id", page.id)
        .order("sort_order", { ascending: true });
      canvasItems = canvasRows ?? [];
    }
  }

  return (
    <PaintingYearDetailAdmin
      yearGroup={year}
      paintings={paintings}
      canvasPage={canvasPage}
      canvasItems={canvasItems}
      paintingNotes={paintingNotes}
    />
  );
}
