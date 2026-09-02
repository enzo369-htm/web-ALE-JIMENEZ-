export type DisplayMode = "a" | "b";

export type Project = {
  id: string;
  slug: string;
  title: string;
  year: string | null;
  location: string | null;
  description: string | null;
  display_mode: DisplayMode;
  sort_order: number;
  canvas_page_id: string | null;
};

export type Work = {
  id: string;
  project_id: string;
  title: string;
  year: string | null;
  medium: string | null;
  cover_image_url: string | null;
  sort_order: number;
};

export type WorkImage = {
  id: string;
  work_id: string;
  image_url: string;
  sort_order: number;
};

export type ProjectNote = {
  id: string;
  project_id: string;
  image_url: string;
  x: number;
  y: number;
  width: number;
  sort_order: number;
};

export type Painting = {
  id: string;
  title: string;
  year: string | null;
  medium: string | null;
  image_url: string;
  sort_order: number;
};

export type TextEntry = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  published_at: string | null;
  sort_order: number;
};

export type HeroLayout = "dual" | "single";

export type SiteSettings = {
  id: number;
  studio_image_url: string | null;
  hero_left_image_url: string | null;
  hero_right_image_url: string | null;
  hero_full_image_url: string | null;
  hero_layout: HeroLayout | null;
  about_bio: string | null;
  about_photo_url: string | null;
  email: string | null;
  instagram: string | null;
};
