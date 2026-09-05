"use client";

import Link from "next/link";
import { HOME_PANELS } from "@/lib/home";
import type { HeroLayout } from "@/lib/types";

const SECTIONS = [
  { href: "/projects", label: "Projects" },
  { href: "/paintings", label: "Paintings" },
  { href: "/texts", label: "Texts" },
  { href: "/about", label: "About" },
] as const;

function Panel({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="relative min-h-[50vh] flex-1 overflow-hidden bg-[#ebe6da] md:min-h-screen">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </div>
  );
}

function HeroChrome() {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-6 py-8 md:px-10">
        <h1 className="pointer-events-auto text-2xl tracking-tight text-ink mix-blend-multiply md:text-3xl">
          Alejandra Jimenez
        </h1>
      </div>

      <nav
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
        aria-label="Sections"
      >
        <ul className="pointer-events-auto flex flex-col items-center gap-4 font-mono-ui text-[13px] uppercase tracking-wide md:gap-5 md:text-[14px]">
          {SECTIONS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-ink mix-blend-multiply transition-opacity hover:opacity-60"
              >
                <span className="text-muted">[</span>
                {" "}
                {item.label}
                <span className="text-muted"> ]</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

export default function StudioHome({
  layout = "dual",
  leftSrc,
  rightSrc,
  fullSrc,
}: {
  layout?: HeroLayout | null;
  leftSrc?: string | null;
  rightSrc?: string | null;
  fullSrc?: string | null;
}) {
  const useSingle = layout === "single" && Boolean(fullSrc);
  const left = leftSrc || HOME_PANELS.left.src;
  const right = rightSrc || HOME_PANELS.right.src;

  return (
    <main className="relative min-h-screen">
      <HeroChrome />

      {useSingle ? (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#ebe6da]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullSrc!}
            alt="Studio"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
      ) : (
        <div className="flex min-h-screen flex-col md:flex-row">
          <Panel src={left} alt={HOME_PANELS.left.alt} />
          <Panel src={right} alt={HOME_PANELS.right.alt} />
        </div>
      )}
    </main>
  );
}
