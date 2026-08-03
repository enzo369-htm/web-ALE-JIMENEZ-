"use client";

import Link from "next/link";
import {
  HOME_PANELS,
  type HomeHotspot,
  type HomePanel,
} from "@/lib/home-hotspots";

function ContourHotspot({ spot }: { spot: HomeHotspot }) {
  return (
    <Link
      href={spot.href}
      className="home-hotspot group pointer-events-auto"
      aria-label={spot.label}
    >
      <polygon points={spot.points} className="home-hotspot-shape" />
    </Link>
  );
}

function Panel({
  panel,
  src,
  alt,
  spots,
}: {
  panel: HomePanel;
  src: string;
  alt: string;
  spots: HomeHotspot[];
}) {
  return (
    <div
      className={`home-panel-${panel} relative min-h-[50vh] flex-1 overflow-hidden bg-[#ebe6da] md:min-h-screen`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <svg
        className="absolute inset-0 z-10 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <filter
            id={`glow-${panel}`}
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.55" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {spots.map((spot) => (
          <ContourHotspot key={spot.id} spot={spot} />
        ))}
      </svg>
    </div>
  );
}

export default function StudioHome({
  hotspots,
}: {
  hotspots: HomeHotspot[];
  /** @deprecated kept for call-site compat during transition */
  studioImageUrl?: string | null;
}) {
  const leftSpots = hotspots.filter((h) => h.panel === "left");
  const rightSpots = hotspots.filter((h) => h.panel === "right");

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-6 py-8 md:px-10">
        <h1 className="pointer-events-auto text-2xl tracking-tight text-ink mix-blend-multiply md:text-3xl">
          Alejandra Jimenez
        </h1>
        <Link
          href="/projects"
          className="pointer-events-auto font-mono-ui text-[11px] uppercase tracking-wide text-muted transition-colors hover:text-ink"
        >
          Enter
        </Link>
      </div>

      <div className="flex min-h-screen flex-col md:flex-row">
        <Panel
          panel="left"
          src={HOME_PANELS.left.src}
          alt={HOME_PANELS.left.alt}
          spots={leftSpots}
        />
        <Panel
          panel="right"
          src={HOME_PANELS.right.src}
          alt={HOME_PANELS.right.alt}
          spots={rightSpots}
        />
      </div>
    </main>
  );
}
