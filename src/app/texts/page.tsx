import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/core/supabase/server";
import type { TextEntry } from "@/lib/types";

export const metadata: Metadata = {
  title: "Texts",
};

export default async function TextsPage() {
  let texts: TextEntry[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("texts")
      .select("id, title, slug, excerpt, body, published_at, sort_order")
      .order("sort_order", { ascending: true });
    texts = (data as TextEntry[]) ?? [];
  } catch {
    texts = [];
  }

  return (
    <main className="min-h-screen pb-24">
      <SiteHeader activeHref="/texts" />
      <div className="site-container pt-6 md:pt-14">
        <h1 className="mb-4 text-accent lowercase text-xl">texts</h1>
        <p className="mb-12 max-w-lg prose-site text-muted">
          Selected writings published here on the site.
        </p>

        <ul className="max-w-2xl space-y-14">
          {texts.length === 0 && (
            <li className="text-muted">No texts yet.</li>
          )}
          {texts.map((t) => (
            <li key={t.id} className="space-y-4">
              <div>
                <h2 className="text-2xl leading-snug">{t.title}</h2>
                {t.published_at && (
                  <p className="mt-1 font-mono-ui text-[11px] uppercase tracking-wide text-muted">
                    {t.published_at}
                  </p>
                )}
              </div>
              {t.excerpt && (
                <p className="prose-site text-muted">{t.excerpt}</p>
              )}
              <Link
                href={`/texts/${t.slug}`}
                className="inline-block font-mono-ui text-xs uppercase tracking-wide text-muted underline underline-offset-4 hover:text-ink"
              >
                Read more →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
