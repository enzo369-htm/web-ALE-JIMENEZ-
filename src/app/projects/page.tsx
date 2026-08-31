import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/core/supabase/server";
import { padIndex, projectMetaLine } from "@/lib/format";
import type { Project } from "@/lib/types";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  let projects: Project[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("projects")
      .select(
        "id, slug, title, year, location, description, display_mode, sort_order, canvas_page_id"
      )
      .order("sort_order", { ascending: true });
    projects = (data as Project[]) ?? [];
  } catch {
    projects = [];
  }

  return (
    <main className="min-h-screen pb-24">
      <SiteHeader activeHref="/projects" />
      <div className="site-container pt-6 md:pt-16">
        <div>
          <h1 className="mb-10 text-accent lowercase text-xl">projects</h1>
          <ol className="space-y-4 text-lg md:text-xl leading-snug">
            {projects.length === 0 && (
              <li className="text-muted text-base">
                Projects will appear here after Supabase is connected and seeded.
              </li>
            )}
            {projects.map((project, i) => (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group transition-colors hover:text-accent"
                >
                  <span className="font-mono-ui text-xs text-muted mr-2">
                    {padIndex(i + 1)}.
                  </span>
                  <span className="lowercase">
                    {projectMetaLine({
                      title: project.title,
                      location: project.location,
                      year: project.year,
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}
