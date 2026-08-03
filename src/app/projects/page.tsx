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
        <div className="grid gap-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
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
          <div className="max-w-md prose-site text-muted lg:pt-16">
            <p>
              Four initial projects. Each opens in its own viewing mode — free
              composition or a studio-wall simulation with process notes.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
