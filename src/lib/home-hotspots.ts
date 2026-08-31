export type HomePanel = "left" | "right";

/**
 * Contour hotspots for the dual studio hero.
 * `points` are SVG polygon points in a 0–100 viewBox (/% of panel).
 */
export type HomeHotspot = {
  id: string;
  label: string;
  href: string;
  panel: HomePanel;
  object?: string;
  /** Polygon points: "x,y x,y ..." in 0–100 space */
  points: string;
  sort_order?: number;
};

export const HOME_PANELS = {
  left: {
    src: "/home/studio-left.png",
    alt: "Studio with portrait and artist",
  },
  right: {
    src: "/home/studio-right.png",
    alt: "Studio with paint cart and owl painting",
  },
} as const;

export const HOME_LINK_OPTIONS = [
  { href: "/projects", label: "Projects" },
  { href: "/paintings", label: "Paintings" },
  { href: "/about", label: "About" },
] as const;

/** Fallback when Supabase has no traced hotspots yet */
export const HOME_HOTSPOTS: HomeHotspot[] = [
  {
    id: "left-portrait",
    label: "Paintings",
    href: "/paintings",
    panel: "left",
    object: "Foreground portrait on stool",
    points: "6,44 40,42 42,92 8,95",
  },
  {
    id: "left-notebook",
    label: "About",
    href: "/about",
    panel: "left",
    object: "Spiral notebook + pen on stool",
    points: "30,80 48,79 49,90 31,92",
  },
  {
    id: "left-artist",
    label: "About",
    href: "/about",
    panel: "left",
    object: "Artist standing by the red chair",
    points: "48,30 58,28 62,38 64,55 62,82 52,84 46,70 45,48",
  },
  {
    id: "left-winged",
    label: "Projects",
    href: "/projects",
    panel: "left",
    object: "Large winged painting behind artist",
    points: "52,6 78,5 80,58 54,60",
  },
  {
    id: "left-brushes",
    label: "Projects",
    href: "/projects",
    panel: "left",
    object: "Jar of brushes on white cabinet",
    points: "82,36 94,35 95,54 83,55",
  },
  {
    id: "right-cart",
    label: "Projects",
    href: "/projects",
    panel: "right",
    object: "Wooden paint cart / palette",
    points: "32,16 68,14 70,22 72,88 66,92 34,90 30,84 30,24",
  },
  {
    id: "right-door",
    label: "About",
    href: "/about",
    panel: "right",
    object: "Open doorway into next room",
    points: "2,6 28,8 29,88 3,90",
  },
  {
    id: "right-owl",
    label: "Paintings",
    href: "/paintings",
    panel: "right",
    object: "Owl / winged canvas on right wall",
    points: "70,10 96,8 98,62 72,64",
  },
  {
    id: "right-notebook",
    label: "About",
    href: "/about",
    panel: "right",
    object: "Notebook on glass stool",
    points: "64,74 88,72 90,88 66,90",
  },
  {
    id: "right-brushes",
    label: "Projects",
    href: "/projects",
    panel: "right",
    object: "Bundle of brushes on cart shelf",
    points: "34,50 68,48 69,62 35,64",
  },
];

export function pointsFromCoords(coords: { x: number; y: number }[]) {
  return coords
    .map((c) => `${round1(c.x)},${round1(c.y)}`)
    .join(" ");
}

export function coordsFromPoints(points: string) {
  return points
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((pair) => {
      const [x, y] = pair.split(",").map(Number);
      return { x, y };
    });
}

export function centroidX(points: string) {
  const pts = coordsFromPoints(points);
  if (!pts.length) return 50;
  return pts.reduce((a, b) => a + b.x, 0) / pts.length;
}

export function centroidY(points: string) {
  const pts = coordsFromPoints(points);
  if (!pts.length) return 50;
  return pts.reduce((a, b) => a + b.y, 0) / pts.length;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
