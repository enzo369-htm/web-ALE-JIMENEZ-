import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/core/supabase/server";
import { padIndex, projectMetaLine } from "@/lib/format";
import type { PaintingYear } from "@/lib/types";

export const metadata: Metadata = {
  title: "Paintings",
};

export default async function PaintingsPage() {
  let years: PaintingYear[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("painting_years")
      .select("id, title, slug, year, description, sort_order, canvas_page_id")
      .order("sort_order", { ascending: true });
    years = (data as PaintingYear[]) ?? [];
  } catch {
    years = [];
  }

  return (
    <main className="min-h-screen pb-24">
      <SiteHeader activeHref="/paintings" />
      <div className="site-container pt-6 md:pt-16">
        <div>
          <h1 className="mb-10 text-accent text-[1.375rem]">
            Selected paintings
          </h1>
          <ol className="space-y-4 text-lg leading-snug md:text-xl">
            {years.length === 0 && (
              <li className="text-base text-muted">
                Year groups will appear here once added in admin.
              </li>
            )}
            {years.map((yearGroup, i) => (
              <li key={yearGroup.id}>
                <Link
                  href={`/paintings/${yearGroup.slug}`}
                  className="group transition-colors hover:text-accent"
                >
                  <span className="font-mono-ui mr-2 text-xs text-muted">
                    {padIndex(i + 1)}.
                  </span>
                  <span className="lowercase">
                    {projectMetaLine({
                      title: yearGroup.title,
                      year: yearGroup.year,
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
