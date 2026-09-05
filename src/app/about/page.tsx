import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/core/supabase/server";
import type { SiteSettings } from "@/lib/types";

export const metadata: Metadata = {
  title: "About",
};

const FALLBACK_BIO =
  "Alejandra Jimenez is an artist whose practice centers on painting. This site extends her studio — a place to wander through projects and selected works.";

export default async function AboutPage() {
  let settings: SiteSettings | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select(
        "id, studio_image_url, about_bio, about_photo_url, email, instagram, cv_url"
      )
      .eq("id", 1)
      .maybeSingle();
    settings = data as SiteSettings | null;
  } catch {
    settings = null;
  }

  const bio = settings?.about_bio || FALLBACK_BIO;
  const email = settings?.email || "hello@alejandrajimenez.example";
  const instagram = settings?.instagram || "https://instagram.com/";

  return (
    <main className="min-h-screen pb-24">
      <SiteHeader activeHref="/about" />
      <div className="site-container pt-6 md:pt-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
          <div className="space-y-10">
            <h1 className="text-accent text-[1.375rem]">About</h1>
            <div>
              <p className="text-3xl md:text-4xl leading-none tracking-tight">
                Alejandra Jimenez
              </p>
            </div>

            <div className="space-y-2 font-mono-ui text-xs leading-relaxed text-muted">
              <p>
                <a href={`mailto:${email}`} className="hover:text-ink">
                  {email}
                </a>
              </p>
              <p>
                <a
                  href={instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ink"
                >
                  Instagram
                </a>
              </p>
              {settings?.cv_url ? (
                <p>
                  <a
                    href={settings.cv_url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ink"
                  >
                    CV
                  </a>
                </p>
              ) : null}
            </div>

            <p className="prose-site max-w-md">{bio}</p>
          </div>

          <div className="space-y-8">
            {settings?.about_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.about_photo_url}
                alt="Alejandra Jimenez"
                className="h-auto w-[85%] object-cover"
              />
            ) : (
              <div className="flex aspect-[4/5] w-[85%] items-end bg-[#e5e0d4] p-6">
                <p className="font-mono-ui text-[11px] uppercase tracking-wide text-muted">
                  Portrait placeholder
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
