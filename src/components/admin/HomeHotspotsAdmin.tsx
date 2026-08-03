"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { createClient } from "@/core/supabase/client";
import {
  HOME_LINK_OPTIONS,
  HOME_PANELS,
  centroidX,
  centroidY,
  pointsFromCoords,
  type HomeHotspot,
  type HomePanel,
} from "@/lib/home-hotspots";

type DraftPoint = { x: number; y: number };

export default function HomeHotspotsAdmin({
  initialItems,
}: {
  initialItems: HomeHotspot[];
}) {
  const [items, setItems] = useState(initialItems);
  const [panel, setPanel] = useState<HomePanel>("left");
  const [draft, setDraft] = useState<DraftPoint[]>([]);
  const [label, setLabel] = useState("Paintings");
  const [href, setHref] = useState("/paintings");
  const [objectNote, setObjectNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const panelItems = useMemo(
    () => items.filter((i) => i.panel === panel),
    [items, panel]
  );

  const draftPoints = pointsFromCoords(draft);

  const pointerToPercent = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    };
  }, []);

  function addPoint(e: React.MouseEvent<SVGSVGElement>) {
    // Ignore right-click
    if (e.button !== 0) return;
    const pt = pointerToPercent(e.clientX, e.clientY);
    if (!pt) return;
    setDraft((prev) => [...prev, pt]);
    setMessage("");
  }

  function undoPoint() {
    setDraft((prev) => prev.slice(0, -1));
  }

  function clearDraft() {
    setDraft([]);
    setEditingId(null);
    setObjectNote("");
  }

  function startEdit(item: HomeHotspot) {
    setPanel(item.panel);
    setEditingId(item.id);
    setLabel(item.label);
    setHref(item.href);
    setObjectNote(item.object ?? "");
    setDraft(
      item.points
        .trim()
        .split(/\s+/)
        .map((pair) => {
          const [x, y] = pair.split(",").map(Number);
          return { x, y };
        })
    );
    setMessage("Editing — adjust points, then Save.");
  }

  async function saveHotspot() {
    if (draft.length < 3) {
      setMessage("Need at least 3 points to close a shape.");
      return;
    }
    if (!label.trim() || !href.trim()) {
      setMessage("Label and link are required.");
      return;
    }

    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const points = pointsFromCoords(draft);
    const sortOrder =
      editingId
        ? items.find((i) => i.id === editingId)?.sort_order ?? 0
        : items.reduce((max, i) => Math.max(max, i.sort_order ?? 0), 0) + 1;

    if (editingId) {
      const { data, error } = await supabase
        .from("home_hotspots")
        .update({
          panel,
          label: label.trim(),
          href: href.trim(),
          object_note: objectNote.trim() || null,
          points,
          sort_order: sortOrder,
        })
        .eq("id", editingId)
        .select("id, panel, label, href, object_note, points, sort_order")
        .single();
      setBusy(false);
      if (error) {
        setMessage(error.message);
        return;
      }
      const next: HomeHotspot = {
        id: data.id,
        panel: data.panel as HomePanel,
        label: data.label,
        href: data.href,
        object: data.object_note ?? undefined,
        points: data.points,
        sort_order: data.sort_order,
      };
      setItems((prev) => prev.map((i) => (i.id === editingId ? next : i)));
      clearDraft();
      setMessage("Updated.");
      return;
    }

    const { data, error } = await supabase
      .from("home_hotspots")
      .insert({
        panel,
        label: label.trim(),
        href: href.trim(),
        object_note: objectNote.trim() || null,
        points,
        sort_order: sortOrder,
      })
      .select("id, panel, label, href, object_note, points, sort_order")
      .single();

    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        id: data.id,
        panel: data.panel as HomePanel,
        label: data.label,
        href: data.href,
        object: data.object_note ?? undefined,
        points: data.points,
        sort_order: data.sort_order,
      },
    ]);
    clearDraft();
    setMessage("Saved. It will appear on the public home.");
  }

  async function removeItem(id: string) {
    if (!confirm("Delete this hotspot?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("home_hotspots").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (editingId === id) clearDraft();
  }

  const panelMeta = HOME_PANELS[panel];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Home hotspots</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-600">
          Click around an object to trace its contour (at least 3 points). Assign
          a link, then save. The public hero will use that shape with a soft glow
          on hover.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(["left", "right"] as HomePanel[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPanel(p);
                clearDraft();
              }}
              className={`px-3 py-2 text-sm border ${
                panel === p
                  ? "border-black bg-black text-white"
                  : "border-gray-300"
              }`}
            >
              {p === "left" ? "Left photo" : "Right photo"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={undoPoint}
          disabled={!draft.length}
          className="border border-gray-300 px-3 py-2 text-sm disabled:opacity-40"
        >
          Undo point
        </button>
        <button
          type="button"
          onClick={clearDraft}
          className="border border-gray-300 px-3 py-2 text-sm"
        >
          Clear draft
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
        <div className="relative aspect-[3/4] w-full overflow-hidden border border-gray-200 bg-[#ebe6da]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={panelMeta.src}
            alt={panelMeta.alt}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          <svg
            ref={svgRef}
            className="absolute inset-0 z-10 h-full w-full cursor-crosshair"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            onClick={addPoint}
          >
            {panelItems.map((item) => (
              <g key={item.id}>
                <polygon
                  points={item.points}
                  fill="rgba(0,0,0,0.06)"
                  stroke={editingId === item.id ? "#111" : "rgba(0,0,0,0.35)"}
                  strokeWidth="0.35"
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={centroidX(item.points)}
                  y={centroidY(item.points)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="2.8"
                  fill="#111"
                  style={{ pointerEvents: "none" }}
                >
                  {item.label}
                </text>
              </g>
            ))}

            {draft.length > 0 && (
              <>
                <polyline
                  points={draft.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="#c45c26"
                  strokeWidth="0.4"
                  vectorEffect="non-scaling-stroke"
                />
                {draft.length >= 3 && (
                  <polygon
                    points={draftPoints}
                    fill="rgba(196,92,38,0.12)"
                    stroke="#c45c26"
                    strokeWidth="0.4"
                    strokeDasharray="1 0.6"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
                {draft.map((p, i) => (
                  <circle
                    key={`${p.x}-${p.y}-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r="0.7"
                    fill="#c45c26"
                  />
                ))}
              </>
            )}
          </svg>
        </div>

        <div className="space-y-4 border border-gray-200 p-4">
          <p className="text-sm text-gray-600">
            Points in draft: <strong>{draft.length}</strong>
            {editingId ? " · editing" : ""}
          </p>

          <label className="block text-sm">
            Label
            <input
              className="mt-1 w-full border border-gray-300 px-3 py-2"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </label>

          <label className="block text-sm">
            Link
            <select
              className="mt-1 w-full border border-gray-300 px-3 py-2"
              value={href}
              onChange={(e) => {
                setHref(e.target.value);
                const opt = HOME_LINK_OPTIONS.find((o) => o.href === e.target.value);
                if (opt) setLabel(opt.label);
              }}
            >
              {HOME_LINK_OPTIONS.map((opt) => (
                <option key={opt.href} value={opt.href}>
                  {opt.label} ({opt.href})
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            Note (optional)
            <input
              className="mt-1 w-full border border-gray-300 px-3 py-2"
              placeholder="e.g. Portrait on stool"
              value={objectNote}
              onChange={(e) => setObjectNote(e.target.value)}
            />
          </label>

          <button
            type="button"
            disabled={busy}
            onClick={() => void saveHotspot()}
            className="w-full bg-black px-4 py-2.5 text-sm text-white disabled:opacity-50"
          >
            {busy ? "Saving…" : editingId ? "Update hotspot" : "Save hotspot"}
          </button>

          {message && <p className="text-sm text-gray-600">{message}</p>}

          <div className="border-t border-gray-200 pt-4">
            <p className="mb-2 text-sm font-medium">
              Saved on this photo ({panelItems.length})
            </p>
            <ul className="space-y-2">
              {panelItems.length === 0 && (
                <li className="text-sm text-gray-500">None yet — start tracing.</li>
              )}
              {panelItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span>
                    {item.label}{" "}
                    <span className="text-gray-400">{item.href}</span>
                  </span>
                  <span className="flex gap-2">
                    <button
                      type="button"
                      className="underline"
                      onClick={() => startEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() => void removeItem(item.id)}
                    >
                      Delete
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
