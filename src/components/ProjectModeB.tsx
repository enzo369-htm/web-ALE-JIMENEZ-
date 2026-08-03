"use client";

import { useMemo, useState } from "react";
import {
  withDefaultPositions,
  type CanvasItemInput,
} from "@/core/free-canvas";
import { workCaption } from "@/lib/format";
import WorkLightbox, { type LightboxWork } from "@/components/WorkLightbox";

export default function ProjectModeB({
  works,
  notes,
  heightRatio = 1.05,
}: {
  works: LightboxWork[];
  notes: CanvasItemInput[];
  heightRatio?: number;
}) {
  const [workIndex, setWorkIndex] = useState(0);
  const [lightbox, setLightbox] = useState<LightboxWork | null>(null);
  const positionedNotes = useMemo(() => withDefaultPositions(notes), [notes]);
  const current = works[workIndex] ?? null;

  return (
    <div className="space-y-8">
      {works.length > 1 && (
        <div className="font-mono-ui flex items-center justify-center gap-6 text-xs uppercase tracking-wide text-muted">
          <button
            type="button"
            disabled={workIndex === 0}
            onClick={() => setWorkIndex((i) => Math.max(0, i - 1))}
            className="disabled:opacity-30 hover:text-ink"
          >
            Prev
          </button>
          <span>
            {workIndex + 1} / {works.length}
          </span>
          <button
            type="button"
            disabled={workIndex >= works.length - 1}
            onClick={() => setWorkIndex((i) => Math.min(works.length - 1, i + 1))}
            className="disabled:opacity-30 hover:text-ink"
          >
            Next
          </button>
        </div>
      )}

      {/* Mobile: stacked */}
      <div className="space-y-10 md:hidden">
        {current && (
          <button
            type="button"
            onClick={() => setLightbox(current)}
            className="mx-auto block w-full max-w-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.images[0]}
              alt={current.title}
              className="mx-auto max-h-[70vh] w-auto object-contain"
            />
            <p className="mt-4 text-center text-sm text-muted">
              {workCaption({
                title: `"${current.title}"`,
                year: current.year,
                medium: current.medium,
              })}
            </p>
          </button>
        )}
        <div className="grid grid-cols-2 gap-4">
          {positionedNotes.map((note) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={note.id}
              src={note.imageUrl}
              alt={note.label || "Studio note"}
              className="w-full h-auto opacity-90"
            />
          ))}
        </div>
      </div>

      {/* Desktop: centered work + free notes */}
      <div
        className="relative mx-auto hidden w-full max-w-5xl md:block"
        style={{ paddingTop: `${heightRatio * 100}%` }}
      >
        {positionedNotes.map((note) => (
          <div
            key={note.id}
            className="absolute pointer-events-none"
            style={{
              left: `${note.x}%`,
              top: `${note.y}%`,
              width: `${note.width}%`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={note.imageUrl}
              alt={note.label || "Studio note"}
              className="block w-full h-auto opacity-95"
            />
          </div>
        ))}

        {current?.images[0] && (
          <button
            type="button"
            onClick={() => setLightbox(current)}
            className="absolute left-1/2 top-1/2 z-10 w-[38%] -translate-x-1/2 -translate-y-1/2 text-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.images[0]}
              alt={current.title}
              className="mx-auto max-h-[70%] w-auto object-contain shadow-sm"
            />
            <p className="mt-4 text-sm text-muted">
              {workCaption({
                title: `"${current.title}"`,
                year: current.year,
                medium: current.medium,
              })}
            </p>
          </button>
        )}

        {!current && (
          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-muted">
            Add works in admin to populate this studio view.
          </p>
        )}
      </div>

      <WorkLightbox work={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
