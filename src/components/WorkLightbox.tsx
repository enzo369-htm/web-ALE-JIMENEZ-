"use client";

import { useCallback, useEffect, useState } from "react";
import { workCaption } from "@/lib/format";

export type LightboxWork = {
  id: string;
  title: string;
  year?: string | null;
  medium?: string | null;
  images: string[];
};

export default function WorkLightbox({
  work,
  onClose,
}: {
  work: LightboxWork | null;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [work?.id]);

  const images = work?.images ?? [];
  const total = images.length;
  const showNav = total > 1;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!total) return;
      setIndex((i) => (i + dir + total) % total);
    },
    [total]
  );

  useEffect(() => {
    if (!work) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [work, onClose, go]);

  if (!work || total === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-bg/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={work.title}
    >
      <div className="flex items-center justify-between px-6 py-5 md:px-10">
        <p className="text-sm md:text-base">
          {workCaption({
            title: `"${work.title}"`,
            year: work.year,
            medium: work.medium,
          })}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="font-mono-ui text-xs uppercase tracking-wide text-muted hover:text-ink"
        >
          Close
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-14 pb-16 md:px-24">
        {showNav && (
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-ink/20 bg-bg/90 text-lg text-ink hover:bg-ink hover:text-bg md:left-6"
            aria-label="Previous image"
          >
            ←
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt={`${work.title} — ${index + 1} of ${total}`}
          className="max-h-[78vh] max-w-full object-contain"
        />

        {showNav && (
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-ink/20 bg-bg/90 text-lg text-ink hover:bg-ink hover:text-bg md:right-6"
            aria-label="Next image"
          >
            →
          </button>
        )}

        {showNav && (
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono-ui text-[11px] text-muted">
            {index + 1} / {total}
          </p>
        )}
      </div>
    </div>
  );
}
