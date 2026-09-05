import { notFound } from "next/navigation";
import { createClient } from "@/core/supabase/server";
import ProjectDetailAdmin from "@/components/admin/ProjectDetailAdmin";
import type { Project, Work, WorkImage, WorkNote } from "@/lib/types";

type Params = { id: string };

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      "id, slug, title, year, location, description, display_mode, sort_order, canvas_page_id"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !project) notFound();

  let projectRow = project as Project;

  if (!projectRow.canvas_page_id) {
    const { data: page, error: pageError } = await supabase
      .from("canvas_pages")
      .insert({
        slug: `project-${projectRow.slug}-${projectRow.id.slice(0, 8)}`,
        title: `${projectRow.title} canvas`,
        height_ratio: 1.15,
      })
      .select("id, height_ratio")
      .single();

    if (!pageError && page) {
      const { error: linkError } = await supabase
        .from("projects")
        .update({ canvas_page_id: page.id, display_mode: "a" })
        .eq("id", projectRow.id);
      if (linkError) {
        await supabase.from("canvas_pages").delete().eq("id", page.id);
      } else {
        projectRow = {
          ...projectRow,
          canvas_page_id: page.id,
          display_mode: "a",
        };
      }
    }
  }

  const { data: works } = await supabase
    .from("works")
    .select(
      "id, project_id, title, year, medium, cover_image_url, tech_sheet_text, sort_order"
    )
    .eq("project_id", id)
    .order("sort_order", { ascending: true });

  const workRows = (works as Work[]) ?? [];
  const workIds = workRows.map((w) => w.id);

  let images: WorkImage[] = [];
  let workNotes: WorkNote[] = [];
  if (workIds.length) {
    const { data } = await supabase
      .from("work_images")
      .select("id, work_id, image_url, sort_order")
      .in("work_id", workIds)
      .order("sort_order", { ascending: true });
    images = (data as WorkImage[]) ?? [];

    const { data: notes } = await supabase
      .from("work_notes")
      .select("id, work_id, image_url, x, y, width, sort_order")
      .in("work_id", workIds)
      .order("sort_order", { ascending: true });
    workNotes = (notes as WorkNote[]) ?? [];
  }

  const worksWithImages = workRows.map((w) => ({
    ...w,
    images: images.filter((img) => img.work_id === w.id),
  }));

  let canvasPage: { id: string; height_ratio: number } | null = null;
  let canvasItems: {
    id: string;
    image_url: string;
    label: string | null;
    x: number;
    y: number;
    width: number;
    work_id: string | null;
  }[] = [];

  if (projectRow.canvas_page_id) {
    const { data: page } = await supabase
      .from("canvas_pages")
      .select("id, height_ratio")
      .eq("id", projectRow.canvas_page_id)
      .maybeSingle();
    canvasPage = page;
    if (page) {
      const { data: rows } = await supabase
        .from("canvas_items")
        .select("id, image_url, label, x, y, width, work_id")
        .eq("page_id", page.id)
        .order("sort_order", { ascending: true });
      canvasItems = rows ?? [];
    }
  }

  return (
    <ProjectDetailAdmin
      project={projectRow}
      works={worksWithImages}
      canvasPage={canvasPage}
      canvasItems={canvasItems}
      workNotes={workNotes}
    />
  );
}
