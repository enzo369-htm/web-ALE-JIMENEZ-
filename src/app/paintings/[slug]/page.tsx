import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import ProjectModeA from "@/components/ProjectModeA";
import { createClient } from "@/core/supabase/server";
import type { LightboxNote, LightboxWork } from "@/components/WorkLightbox";
import type {
  Painting,
  PaintingImage,
  PaintingNote,
  PaintingYear,
} from "@/lib/types";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

async function loadYear(slug: string) {
  const supabase = await createClient();

  const { data: yearGroup } = await supabase
    .from("painting_years")
    .select("id, title, slug, year, description, sort_order, canvas_page_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!yearGroup) return null;

  const { data: paintingRows } = await supabase
    .from("paintings")
    .select(
      "id, year_id, title, year, medium, image_url, cover_image_url, tech_sheet_url, sort_order"
    )
    .eq("year_id", yearGroup.id)
    .order("sort_order", { ascending: true });

  const rows = (paintingRows as Painting[]) ?? [];
  const paintingIds = rows.map((p) => p.id);

  let images: PaintingImage[] = [];
  let notes: PaintingNote[] = [];
  if (paintingIds.length) {
    const { data } = await supabase
      .from("painting_images")
      .select("id, painting_id, image_url, sort_order")
      .in("painting_id", paintingIds)
      .order("sort_order", { ascending: true });
    images = (data as PaintingImage[]) ?? [];

    const { data: noteRows } = await supabase
      .from("painting_notes")
      .select("id, painting_id, image_url, x, y, width, sort_order")
      .in("painting_id", paintingIds)
      .order("sort_order", { ascending: true });
    notes = (noteRows as PaintingNote[]) ?? [];
  }

  const notesByPainting = notes.reduce<Record<string, LightboxNote[]>>(
    (acc, n) => {
      (acc[n.painting_id] ??= []).push({
        id: n.id,
        imageUrl: n.image_url,
        x: n.x,
        y: n.y,
        width: n.width,
      });
      return acc;
    },
    {}
  );

  const worksForLightbox: LightboxWork[] = rows.map((p) => {
    const imgs = images
      .filter((img) => img.painting_id === p.id)
      .map((img) => img.image_url);
    if (imgs.length === 0 && p.cover_image_url) imgs.push(p.cover_image_url);
    if (imgs.length === 0 && p.image_url) imgs.push(p.image_url);
    return {
      id: p.id,
      title: p.title,
      year: p.year,
      medium: p.medium,
      images: imgs,
      notes: notesByPainting[p.id] ?? [],
      techSheetUrl: p.tech_sheet_url,
    };
  });

  const worksById = Object.fromEntries(
    worksForLightbox.map((w) => [w.id, w])
  );

  let canvasItems: {
    id: string;
    imageUrl: string;
    x: number;
    y: number;
    width: number;
    label?: string;
    workId?: string | null;
  }[] = [];
  let heightRatio = 1.15;

  if (yearGroup.canvas_page_id) {
    const { data: page } = await supabase
      .from("canvas_pages")
      .select("id, height_ratio")
      .eq("id", yearGroup.canvas_page_id)
      .maybeSingle();

    heightRatio = page?.height_ratio ?? 1.15;

    const { data: canvasRows } = await supabase
      .from("canvas_items")
      .select("id, image_url, label, x, y, width, painting_id")
      .eq("page_id", yearGroup.canvas_page_id)
      .order("sort_order", { ascending: true });

    canvasItems = (canvasRows ?? []).map((r) => ({
      id: r.id,
      imageUrl: r.image_url,
      x: r.x,
      y: r.y,
      width: r.width,
      label: r.label ?? undefined,
      workId: r.painting_id,
      meta: r.painting_id ? { workId: r.painting_id } : undefined,
    }));
  }

  return {
    yearGroup: yearGroup as PaintingYear,
    worksForLightbox,
    worksById,
    canvasItems,
    heightRatio,
  };
}

export default async function PaintingYearPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  let payload: Awaited<ReturnType<typeof loadYear>> = null;
  try {
    payload = await loadYear(slug);
  } catch {
    payload = null;
  }

  if (!payload) notFound();

  const { yearGroup, worksById, canvasItems, heightRatio } = payload;

  return (
    <main className="min-h-screen pb-24">
      <SiteHeader activeHref="/paintings" />
      <div className="site-container pt-4 md:pt-10">
        <div className="mb-10 flex flex-col items-start gap-4 md:items-center md:text-center">
          <p className="text-accent text-xl lowercase md:text-2xl">
            {yearGroup.title}
            {yearGroup.year && yearGroup.year !== yearGroup.title
              ? `, ${yearGroup.year}`
              : ""}
          </p>
          <span className="text-accent text-sm" aria-hidden>
            ⊹
          </span>
          {yearGroup.description && (
            <p className="max-w-xl prose-site text-muted md:text-center">
              {yearGroup.description}
            </p>
          )}
          <Link
            href="/paintings"
            className="font-mono-ui text-[11px] uppercase tracking-wide text-muted hover:text-ink"
          >
            ← Selected paintings
          </Link>
        </div>

        {canvasItems.length === 0 && (
          <p className="text-center text-sm text-muted">
            No paintings on the canvas yet. Add and position images in admin.
          </p>
        )}
      </div>

      {canvasItems.length > 0 && (
        <div className="mx-auto w-[90vw] max-w-none">
          <ProjectModeA
            items={canvasItems}
            heightRatio={heightRatio}
            worksById={worksById}
          />
        </div>
      )}
    </main>
  );
}
