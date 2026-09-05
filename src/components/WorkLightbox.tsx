"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { withDefaultPositions } from "@/core/free-canvas";
import { workCaption } from "@/lib/format";
import {
  LIGHTBOX_CENTER_IMG_CLASS,
  LIGHTBOX_STAGE_PAD,
} from "@/lib/lightbox-stage";

export type LightboxNote = {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  width: number;
};

export type LightboxWork = {
  id: string;
  title: string;
  year?: string | null;
  medium?: string | null;
  images: string[];
  notes?: LightboxNote[];
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
  const notes = useMemo(
    () => withDefaultPositions(work?.notes ?? []),
    [work?.notes]
  );
  const hasNotes = notes.length > 0;

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
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-bg/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={work.title}
    >
      <div className="flex shrink-0 items-center justify-between px-6 py-5 md:px-10">
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

      <div className={LIGHTBOX_STAGE_PAD}>
        {/* Mobile: image + notes stacked */}
        <div className="flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden md:hidden">
          <div className="relative flex w-full items-center justify-center px-10">
            {showNav && (
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-ink/20 bg-bg/90 text-ink"
                aria-label="Previous image"
              >
                ←
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[index]}
              alt={`${work.title} — ${index + 1} of ${total}`}
              className="max-h-[55vh] max-w-full object-contain"
            />
            {showNav && (
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-ink/20 bg-bg/90 text-ink"
                aria-label="Next image"
              >
                →
              </button>
            )}
          </div>
          {hasNotes && (
            <div className="grid w-full grid-cols-2 gap-4 overflow-auto px-2">
              {notes.map((note) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={note.id}
                  src={note.imageUrl}
                  alt=""
                  className="h-auto w-full opacity-90"
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop: same coordinate space as admin NotesEditorModal */}
        <div className="relative hidden min-h-0 flex-1 overflow-hidden md:block">
          <div className="absolute inset-0">
            {notes.map((note) => (
              <div
                key={note.id}
                className="pointer-events-none absolute"
                style={{
                  left: `${note.x}%`,
                  top: `${note.y}%`,
                  width: `${note.width}%`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={note.imageUrl}
                  alt=""
                  className="block h-auto w-full opacity-95"
                />
              </div>
            ))}
          </div>

          <div className="absolute inset-0 z-10 flex items-center justify-center px-24">
            {showNav && (
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-6 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-ink/20 bg-bg/90 text-lg text-ink hover:bg-ink hover:text-bg"
                aria-label="Previous image"
              >
                ←
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[index]}
              alt={`${work.title} — ${index + 1} of ${total}`}
              className={LIGHTBOX_CENTER_IMG_CLASS}
            />
            {showNav && (
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-6 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-ink/20 bg-bg/90 text-lg text-ink hover:bg-ink hover:text-bg"
                aria-label="Next image"
              >
                →
              </button>
            )}
          </div>

          {showNav && (
            <p className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 font-mono-ui text-[11px] text-muted">
              {index + 1} / {total}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
