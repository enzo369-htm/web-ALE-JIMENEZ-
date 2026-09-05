"use client";

import { useRef, type PointerEvent } from "react";
import type { CanvasItem } from "./types";
import { clamp } from "./layout";

type Interaction =
  | {
      type: "drag";
      id: string;
      startPx: number;
      startPy: number;
      originX: number;
      originY: number;
      rectW: number;
      rectH: number;
    }
  | {
      type: "resize";
      id: string;
      startPx: number;
      originWidth: number;
      rectW: number;
    }
  | null;

export type CanvasEditorProps = {
  items: CanvasItem[];
  heightRatio: number;
  onChange: (items: CanvasItem[]) => void;
  onHeightRatioChange?: (ratio: number) => void;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  /** Show height slider. Default true. */
  showHeightControl?: boolean;
  /**
   * Fill the parent instead of using paddingTop aspect-ratio.
   * Parent must be `relative` with a defined size (e.g. lightbox stage).
   */
  fillContainer?: boolean;
  /** Non-interactive centered image (lightbox / notes editor preview). */
  overlayCenterUrl?: string | null;
  overlayCenterLabel?: string | null;
  /** Extra class on the center overlay image (must match public lightbox). */
  overlayCenterImgClassName?: string;
  className?: string;
};

/**
 * Controlled free-canvas editor (drag + resize).
 * Persistence is the host's job via onChange.
 */
export function CanvasEditor({
  items,
  heightRatio,
  onChange,
  onHeightRatioChange,
  selectedId = null,
  onSelect,
  showHeightControl = true,
  fillContainer = false,
  overlayCenterUrl = null,
  overlayCenterLabel = null,
  overlayCenterImgClassName = "mx-auto max-h-full w-auto object-contain opacity-90 shadow-sm",
  className = "",
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const interaction = useRef<Interaction>(null);

  function updateItem(id: string, patch: Partial<CanvasItem>) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function onPointerDownItem(e: PointerEvent, item: CanvasItem) {
    e.preventDefault();
    onSelect?.(item.id);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    interaction.current = {
      type: "drag",
      id: item.id,
      startPx: e.clientX,
      startPy: e.clientY,
      originX: item.x,
      originY: item.y,
      rectW: rect.width,
      rectH: rect.height,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerDownResize(e: PointerEvent, item: CanvasItem) {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(item.id);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    interaction.current = {
      type: "resize",
      id: item.id,
      startPx: e.clientX,
      originWidth: item.width,
      rectW: rect.width,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    const act = interaction.current;
    if (!act) return;

    if (act.type === "drag") {
      const dx = ((e.clientX - act.startPx) / act.rectW) * 100;
      const dy = ((e.clientY - act.startPy) / act.rectH) * 100;
      updateItem(act.id, {
        x: clamp(act.originX + dx, 0, 95),
        y: clamp(act.originY + dy, 0, 98),
      });
    } else {
      const dw = ((e.clientX - act.startPx) / act.rectW) * 100;
      updateItem(act.id, {
        width: clamp(act.originWidth + dw, 5, 90),
      });
    }
  }

  function onPointerUp() {
    interaction.current = null;
  }

  const canvas = (
    <div
      ref={canvasRef}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={
        fillContainer
          ? "absolute inset-0 touch-none select-none overflow-hidden bg-bg"
          : "relative w-full touch-none select-none overflow-hidden border border-gray-300 bg-white"
      }
      style={fillContainer ? undefined : { paddingTop: `${heightRatio * 100}%` }}
    >
      {overlayCenterUrl && (
        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center px-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={overlayCenterUrl}
            alt={overlayCenterLabel || "Center preview"}
            className={overlayCenterImgClassName}
          />
        </div>
      )}
      {items.map((item) => (
        <div
          key={item.id}
          onPointerDown={(e) => onPointerDownItem(e, item)}
          className="absolute cursor-move"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: `${item.width}%`,
            outline: selectedId === item.id ? "2px solid #1a1a1a" : "none",
            outlineOffset: "2px",
            zIndex: selectedId === item.id ? 20 : 10,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.label || "Image"}
            draggable={false}
            className="pointer-events-none block h-auto w-full"
          />
          {selectedId === item.id && (
            <div
              onPointerDown={(e) => onPointerDownResize(e, item)}
              className="absolute bottom-0 right-0 h-4 w-4 translate-x-1/2 translate-y-1/2 cursor-se-resize bg-black"
              style={{ zIndex: 30 }}
            />
          )}
        </div>
      ))}
    </div>
  );

  if (fillContainer) {
    return <div className={`absolute inset-0 ${className}`}>{canvas}</div>;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {showHeightControl && onHeightRatioChange && (
        <div className="flex items-center gap-3">
          <label className="text-sm">Canvas height:</label>
          <input
            type="range"
            min={0.6}
            max={2.5}
            step={0.1}
            value={heightRatio}
            onChange={(e) =>
              onHeightRatioChange(parseFloat(e.target.value))
            }
          />
          <span className="text-sm text-gray-500">
            {heightRatio.toFixed(1)}×
          </span>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Drag images to move. Pull the bottom-right corner to resize.
      </p>

      {canvas}
    </div>
  );
}
