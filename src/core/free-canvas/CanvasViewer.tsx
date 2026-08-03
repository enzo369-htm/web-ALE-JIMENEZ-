"use client";

import { useState, type ReactNode } from "react";
import type { CanvasItem, CanvasItemInput } from "./types";
import { withDefaultPositions } from "./layout";

export type CanvasViewerProps = {
  items: CanvasItemInput[];
  /** Canvas height as multiple of width (padding-top %). Default 1.2 */
  heightRatio?: number | null;
  /** Optional render under each image (desktop hover / mobile always). */
  renderCaption?: (item: CanvasItem) => ReactNode;
  className?: string;
};

function DesktopItem({
  item,
  renderCaption,
}: {
  item: CanvasItem;
  renderCaption?: (item: CanvasItem) => ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const caption = renderCaption?.(item);

  return (
    <div
      className="absolute"
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        width: `${item.width}%`,
        zIndex: hovered ? 20 : 10,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative inline-block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.label || "Image"}
          className="block w-full h-auto"
        />
        {caption && hovered && (
          <div className="absolute left-0 top-full z-10 mt-1 w-max max-w-[min(100vw,28rem)]">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}

function StackedItem({
  item,
  renderCaption,
}: {
  item: CanvasItem;
  renderCaption?: (item: CanvasItem) => ReactNode;
}) {
  const caption = renderCaption?.(item);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full max-w-[420px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.label || "Image"}
          className="block w-full h-auto"
        />
      </div>
      {caption && <div className="text-center text-sm">{caption}</div>}
    </div>
  );
}

/**
 * Public free-canvas gallery.
 * Desktop: absolute % layout. Mobile: single column (ignores x/y).
 */
export function CanvasViewer({
  items,
  heightRatio,
  renderCaption,
  className = "",
}: CanvasViewerProps) {
  const positioned = withDefaultPositions(items);
  const ratio = heightRatio ?? 1.2;

  if (positioned.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex flex-col gap-10 md:hidden">
        {positioned.map((item) => (
          <StackedItem
            key={item.id}
            item={item}
            renderCaption={renderCaption}
          />
        ))}
      </div>

      <div
        className="relative w-full hidden md:block"
        style={{ paddingTop: `${ratio * 100}%` }}
      >
        {positioned.map((item) => (
          <DesktopItem
            key={item.id}
            item={item}
            renderCaption={renderCaption}
          />
        ))}
      </div>
    </div>
  );
}
