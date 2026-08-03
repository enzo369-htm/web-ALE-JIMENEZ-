"use client";

import Link from "next/link";
import { HOME_HOTSPOTS } from "@/lib/home-hotspots";

export default function StudioHome({
  studioImageUrl,
}: {
  studioImageUrl: string | null;
}) {
  const hasImage = Boolean(studioImageUrl);

  return (
    <main className="relative min-h-screen">
      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between px-6 py-8 md:px-10">
        <h1 className="text-2xl md:text-3xl tracking-tight mix-blend-multiply">
          Alejandra Jimenez
        </h1>
        <Link
          href="/projects"
          className="font-mono-ui text-[11px] uppercase tracking-wide text-muted hover:text-ink transition-colors"
        >
          Enter
        </Link>
      </div>

      <div className="relative min-h-screen w-full overflow-hidden bg-[#ebe6da]">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={studioImageUrl!}
            alt="Artist studio"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-8">
            <p className="max-w-md text-center text-muted prose-site">
              Studio photograph placeholder. Upload the studio image in{" "}
              <span className="text-ink">Admin → About</span>, then tune hotspot
              positions in <code className="text-sm">src/lib/home-hotspots.ts</code>.
            </p>
          </div>
        )}

        <div className="absolute inset-0">
          {HOME_HOTSPOTS.map((spot) => (
            <Link
              key={spot.id}
              href={spot.href}
              className="group absolute z-10 block"
              style={{
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                width: `${spot.width}%`,
                height: `${spot.height}%`,
              }}
              aria-label={spot.label}
            >
              <span className="absolute inset-0 rounded-sm border border-transparent transition-all duration-300 group-hover:border-ink/25 group-hover:bg-bg/20" />
              <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-bg/90 px-3 py-1 text-sm opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                {spot.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
