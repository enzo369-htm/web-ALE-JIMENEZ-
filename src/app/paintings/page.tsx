import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/core/supabase/server";
import { workCaption } from "@/lib/format";
import type { Painting } from "@/lib/types";

export const metadata: Metadata = {
  title: "Paintings",
};

export default async function PaintingsPage() {
  let paintings: Painting[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("paintings")
      .select("id, title, year, medium, image_url, sort_order")
      .order("sort_order", { ascending: true });
    paintings = (data as Painting[]) ?? [];
  } catch {
    paintings = [];
  }

  return (
    <main className="min-h-screen pb-24">
      <SiteHeader activeHref="/paintings" />
      <div className="site-container pt-6 md:pt-14">
        <h1 className="mb-12 text-accent lowercase text-xl">selected paintings</h1>

        {paintings.length === 0 ? (
          <p className="text-muted prose-site max-w-md">
            Selected paintings will appear in a simple gallery once added in
            admin.
          </p>
        ) : (
          <ul className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {paintings.map((p) => (
              <li key={p.id} className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image_url}
                  alt={p.title}
                  className="w-full h-auto object-contain"
                />
                <p className="text-sm text-muted text-center">
                  {workCaption({
                    title: `"${p.title}"`,
                    year: p.year,
                    medium: p.medium,
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
