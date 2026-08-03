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

      <div
        ref={canvasRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative w-full bg-white border border-gray-300 overflow-hidden touch-none select-none"
        style={{ paddingTop: `${heightRatio * 100}%` }}
      >
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
              className="block w-full h-auto pointer-events-none"
            />
            {selectedId === item.id && (
              <div
                onPointerDown={(e) => onPointerDownResize(e, item)}
                className="absolute bottom-0 right-0 w-4 h-4 bg-black cursor-se-resize translate-x-1/2 translate-y-1/2"
                style={{ zIndex: 30 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
