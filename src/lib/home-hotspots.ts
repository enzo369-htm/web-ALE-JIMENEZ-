export type HomeHotspot = {
  id: string;
  label: string;
  href: string;
  /** Left as % of image width */
  x: number;
  /** Top as % of image height */
  y: number;
  /** Width as % of image width */
  width: number;
  /** Height as % of image height */
  height: number;
};

/**
 * Interactive zones on the studio home image.
 * Positions are approximate placeholders — tune once the real photo is in place.
 */
export const HOME_HOTSPOTS: HomeHotspot[] = [
  {
    id: "projects",
    label: "Projects",
    href: "/projects",
    x: 12,
    y: 28,
    width: 22,
    height: 30,
  },
  {
    id: "paintings",
    label: "Paintings",
    href: "/paintings",
    x: 42,
    y: 18,
    width: 20,
    height: 28,
  },
  {
    id: "texts",
    label: "Texts",
    href: "/texts",
    x: 68,
    y: 24,
    width: 18,
    height: 22,
  },
  {
    id: "sounds",
    label: "Sounds",
    href: "/sounds",
    x: 22,
    y: 62,
    width: 20,
    height: 20,
  },
  {
    id: "about",
    label: "About",
    href: "/about",
    x: 58,
    y: 58,
    width: 22,
    height: 24,
  },
];
