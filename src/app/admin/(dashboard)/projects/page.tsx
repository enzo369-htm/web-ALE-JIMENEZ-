import { createClient } from "@/core/supabase/server";
import ProjectsAdmin from "@/components/admin/ProjectsAdmin";
import type { Project } from "@/lib/types";

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, slug, title, year, location, description, display_mode, sort_order, canvas_page_id"
    )
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="space-y-3 text-sm">
        <h1 className="text-2xl font-medium">Projects</h1>
        <p className="text-red-600">
          Could not load projects. Run SQL files in <code>supabase/</code>{" "}
          (especially 004+).
        </p>
        <p className="text-gray-500">{error.message}</p>
      </div>
    );
  }

  return <ProjectsAdmin initialProjects={(data as Project[]) ?? []} />;
}
