import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import AudioPlayer from "@/components/AudioPlayer";
import { createClient } from "@/core/supabase/server";
import type { SoundTrack } from "@/lib/types";

export const metadata: Metadata = {
  title: "Sounds",
};

export default async function SoundsPage() {
  let sounds: SoundTrack[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("sounds")
      .select("id, title, audio_url, cover_image_url, sort_order")
      .order("sort_order", { ascending: true });
    sounds = (data as SoundTrack[]) ?? [];
  } catch {
    sounds = [];
  }

  return (
    <main className="min-h-screen pb-24">
      <SiteHeader activeHref="/sounds" />
      <div className="site-container pt-6 md:pt-14">
        <h1 className="mb-4 text-accent lowercase text-xl">sounds</h1>
        <p className="mb-12 max-w-lg prose-site text-muted">
          Listening pieces from the studio. Press play to hear each track.
        </p>

        <div className="max-w-2xl">
          {sounds.length === 0 ? (
            <p className="text-muted">No sounds yet. Upload audio in admin.</p>
          ) : (
            sounds.map((s) => (
              <AudioPlayer key={s.id} title={s.title} src={s.audio_url} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
