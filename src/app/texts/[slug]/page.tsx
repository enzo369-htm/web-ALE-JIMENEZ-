import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/core/supabase/server";
import type { TextEntry } from "@/lib/types";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("texts")
      .select("title")
      .eq("slug", slug)
      .maybeSingle();
    if (data?.title) return { title: data.title };
  } catch {
    /* ignore */
  }
  return { title: "Text" };
}

export default async function TextDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  let text: TextEntry | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("texts")
      .select("id, title, slug, excerpt, body, published_at, sort_order")
      .eq("slug", slug)
      .maybeSingle();
    text = (data as TextEntry | null) ?? null;
  } catch {
    text = null;
  }

  if (!text) notFound();

  return (
    <main className="min-h-screen pb-24">
      <SiteHeader activeHref="/texts" />
      <article className="site-container max-w-2xl pt-6 md:pt-14">
        <Link
          href="/texts"
          className="mb-10 inline-block font-mono-ui text-[11px] uppercase tracking-wide text-muted hover:text-ink"
        >
          ← Texts
        </Link>
        <h1 className="text-3xl leading-snug md:text-4xl">{text.title}</h1>
        {text.published_at && (
          <p className="mt-3 font-mono-ui text-[11px] uppercase tracking-wide text-muted">
            {text.published_at}
          </p>
        )}
        <div className="prose-site mt-10 whitespace-pre-wrap text-ink">
          {text.body}
        </div>
      </article>
    </main>
  );
}
