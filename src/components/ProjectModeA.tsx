"use client";

import { useMemo, useState } from "react";
import {
  withDefaultPositions,
  type CanvasItemInput,
} from "@/core/free-canvas";
import WorkLightbox, { type LightboxWork } from "@/components/WorkLightbox";

type CanvasWorkItem = CanvasItemInput & { workId?: string | null };

function resolveWorkId(item: CanvasWorkItem): string | null {
  if (item.workId) return item.workId;
  const fromMeta = item.meta?.workId;
  return typeof fromMeta === "string" ? fromMeta : null;
}

export default function ProjectModeA({
  items,
  heightRatio,
  worksById,
}: {
  items: CanvasWorkItem[];
  heightRatio: number;
  worksById: Record<string, LightboxWork>;
}) {
  const [active, setActive] = useState<LightboxWork | null>(null);
  const positioned = useMemo(() => withDefaultPositions(items), [items]);

  function openItem(item: CanvasWorkItem) {
    const workId = resolveWorkId(item);
    if (workId && worksById[workId]) {
      setActive(worksById[workId]);
      return;
    }
    if (item.imageUrl) {
      setActive({
        id: item.id,
        title: item.label || "Work",
        images: [item.imageUrl],
      });
    }
  }

  return (
    <>
      <div className="flex flex-col gap-10 md:hidden">
        {positioned.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openItem(item)}
            className="mx-auto w-full max-w-[420px] text-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.label || "Work"}
              className="block w-full h-auto"
            />
            {item.label && (
              <p className="mt-3 text-center text-sm text-muted">{item.label}</p>
            )}
          </button>
        ))}
      </div>

      <div
        className="relative hidden w-full md:block"
        style={{ paddingTop: `${heightRatio * 100}%` }}
      >
        {positioned.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openItem(item)}
            className="absolute text-left transition-opacity hover:opacity-90"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: `${item.width}%`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.label || "Work"}
              className="block w-full h-auto"
            />
          </button>
        ))}
      </div>

      <WorkLightbox work={active} onClose={() => setActive(null)} />
    </>
  );
}
