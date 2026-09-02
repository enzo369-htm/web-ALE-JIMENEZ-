export type HomePanel = "left" | "right";

/** Dual studio hero photos (no hotspot overlays on this site). */
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
