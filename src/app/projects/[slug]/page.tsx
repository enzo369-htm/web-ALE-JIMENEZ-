import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import ProjectModeA from "@/components/ProjectModeA";
import ProjectModeB from "@/components/ProjectModeB";
import { createClient } from "@/core/supabase/server";
import type { LightboxWork } from "@/components/WorkLightbox";
import type { Project, Work, WorkImage, ProjectNote } from "@/lib/types";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

async function loadProject(slug: string) {
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, slug, title, year, location, description, display_mode, sort_order, canvas_page_id"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!project) return null;

  const { data: works } = await supabase
    .from("works")
    .select("id, project_id, title, year, medium, cover_image_url, sort_order")
    .eq("project_id", project.id)
    .order("sort_order", { ascending: true });

  const workRows = (works as Work[]) ?? [];
  const workIds = workRows.map((w) => w.id);

  let images: WorkImage[] = [];
  if (workIds.length) {
    const { data } = await supabase
      .from("work_images")
      .select("id, work_id, image_url, sort_order")
      .in("work_id", workIds)
      .order("sort_order", { ascending: true });
    images = (data as WorkImage[]) ?? [];
  }

  const worksForLightbox: LightboxWork[] = workRows.map((w) => {
    const imgs = images
      .filter((img) => img.work_id === w.id)
      .map((img) => img.image_url);
    if (imgs.length === 0 && w.cover_image_url) imgs.push(w.cover_image_url);
    return {
      id: w.id,
      title: w.title,
      year: w.year,
      medium: w.medium,
      images: imgs,
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

  if (project.display_mode === "a" && project.canvas_page_id) {
    const { data: page } = await supabase
      .from("canvas_pages")
      .select("id, height_ratio")
      .eq("id", project.canvas_page_id)
      .maybeSingle();

    heightRatio = page?.height_ratio ?? 1.15;

    const { data: rows } = await supabase
      .from("canvas_items")
      .select("id, image_url, label, x, y, width, work_id")
      .eq("page_id", project.canvas_page_id)
      .order("sort_order", { ascending: true });

    canvasItems = (rows ?? []).map((r) => ({
      id: r.id,
      imageUrl: r.image_url,
      x: r.x,
      y: r.y,
      width: r.width,
      label: r.label ?? undefined,
      workId: r.work_id,
      meta: r.work_id ? { workId: r.work_id } : undefined,
    }));
  }

  let notes: ProjectNote[] = [];
  if (project.display_mode === "b") {
    const { data } = await supabase
      .from("project_notes")
      .select("id, project_id, image_url, x, y, width, sort_order")
      .eq("project_id", project.id)
      .order("sort_order", { ascending: true });
    notes = (data as ProjectNote[]) ?? [];
  }

  return {
    project: project as Project,
    worksForLightbox,
    worksById,
    canvasItems,
    heightRatio,
    notes,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  let payload: Awaited<ReturnType<typeof loadProject>> = null;
  try {
    payload = await loadProject(slug);
  } catch {
    payload = null;
  }

  if (!payload) notFound();

  const { project, worksForLightbox, worksById, canvasItems, heightRatio, notes } =
    payload;

  return (
    <main className="min-h-screen pb-24">
      <SiteHeader activeHref="/projects" />
      <div className="site-container pt-4 md:pt-10">
        <div className="mb-10 flex flex-col items-start gap-4 md:items-center md:text-center">
          <p className="text-accent lowercase text-xl md:text-2xl">
            {project.title}
            {project.year ? `, ${project.year}` : ""}
          </p>
          <span className="text-accent text-sm" aria-hidden>
            ⊹
          </span>
          {project.description && (
            <p className="max-w-xl prose-site text-muted md:text-center">
              {project.description}
            </p>
          )}
          <Link
            href="/projects"
            className="font-mono-ui text-[11px] uppercase tracking-wide text-muted hover:text-ink"
          >
            ← All projects
          </Link>
        </div>

        {project.display_mode === "a" && canvasItems.length === 0 && (
          <p className="text-center text-sm text-muted">
            No works on the canvas yet. Add and position images in admin.
          </p>
        )}

        {project.display_mode === "b" && (
          <ProjectModeB
            works={worksForLightbox.filter((w) => w.images.length > 0)}
            notes={notes.map((n) => ({
              id: n.id,
              imageUrl: n.image_url,
              x: n.x,
              y: n.y,
              width: n.width,
              label: "note",
            }))}
          />
        )}
      </div>

      {project.display_mode === "a" && canvasItems.length > 0 && (
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
