export type CanvasItem = {
  id: string;
  imageUrl: string;
  /** Left position as % of canvas width (0–100). */
  x: number;
  /** Top position as % of canvas height (0–100). */
  y: number;
  /** Width as % of canvas width (0–100). */
  width: number;
  /** Optional alt / caption. */
  label?: string;
  /** Host-defined extras (caption fields, etc.). */
  meta?: Record<string, unknown>;
};

export type CanvasItemInput = {
  id: string;
  imageUrl: string;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  label?: string;
  meta?: Record<string, unknown>;
};
