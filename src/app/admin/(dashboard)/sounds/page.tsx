import { createClient } from "@/core/supabase/server";
import SoundsAdmin from "@/components/admin/SoundsAdmin";
import type { SoundTrack } from "@/lib/types";

export default async function AdminSoundsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sounds")
    .select("id, title, audio_url, cover_image_url, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="space-y-2 text-sm">
        <h1 className="text-2xl font-medium">Sounds</h1>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  return <SoundsAdmin initialItems={(data as SoundTrack[]) ?? []} />;
}
