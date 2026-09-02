# Alejandra Jimenez

Next.js 15 + Supabase site built on the local **studio-starter** kit.

- **`src/core/`** — reusable kit (auth, supabase clients, upload, admin-shell, free-canvas). Do not put client domain logic here.
- **`src/app/`**, **`src/components/`**, **`src/lib/`** — Alejandra’s public site + CMS domain.

Language: English. Design: warm off-white, EB Garamond, minimal editorial layout.

## Quick start

```bash
npm install
cp .env.example .env.local
# fill Supabase URL + anon key after creating the project
npm run dev
```

- Public home: [http://localhost:3000](http://localhost:3000)
- Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## What is the CMS Admin?

Minimal panel for the client:

- Login via Supabase Auth (email/password)
- Middleware protecting `/admin/*`
- Upload to Storage (`uploads` bucket) with image downscale
- Edit: projects/works, paintings, about + home studio image
- Design A canvas editor and Design B notes editor live inside each project

## What is free positioning (free-canvas)?

Kit module in `src/core/free-canvas`:

- **Admin:** drag/resize images in % (`CanvasEditor`)
- **Public Design A:** same positions on desktop; stacked on mobile (`ProjectModeA`)
- Clicking a work opens a **carousel** of that work’s photos

Design B reuses the same editor pattern for **handwritten note scans** around a centered work.

## Public routes

| Route | Purpose |
|-------|---------|
| `/` | Interactive studio home (hotspots → sections) |
| `/projects` | Project index |
| `/projects/[slug]` | Design A or B viewer |
| `/paintings` | Selected paintings gallery |
| `/about` | Bio, portrait, email, Instagram |

## Admin routes

| Route | Purpose |
|-------|---------|
| `/admin/login` | Sign in |
| `/admin` | Overview |
| `/admin/projects` | Project list / create |
| `/admin/projects/[id]` | Details, works, canvas (A) or notes (B) |
| `/admin/paintings` | Selected paintings |
| `/admin/about` | Bio, contact, studio home image |
| `/admin/canvas` | Kit demo canvas (`slug=demo`) |

Hero photos: [`src/lib/home.ts`](src/lib/home.ts) (`public/home/studio-left.png`, `studio-right.png`). Contour-hotspot kit lives outside this repo in `Desktop/webs/sistema seleccion de objetos`.

## Supabase checklist (manual)

1. Create a **new** Supabase project (do **not** use Nathalia’s project).
2. SQL Editor — run in order:
   - `supabase/001_storage_notes.sql` (notes for bucket policies)
   - `supabase/002_free_canvas_items.sql`
   - `supabase/003_site_content.sql`
   - `supabase/004_projects.sql`
   - `supabase/005_works.sql`
   - `supabase/006_project_notes.sql`
   - `supabase/007_paintings_texts_sounds.sql`
   - `supabase/008_home_hotspots.sql` (opcional / legacy; el hero ya no usa hotspots — kit en Desktop/webs/sistema seleccion de objetos)
   - `supabase/009_drop_sounds.sql` (if upgrading an older project that had Sounds)
   - `supabase/010_drop_texts.sql` (if upgrading an older project that had Texts)
3. Storage → create bucket **`uploads`** (public read; write for `authenticated`). Apply policies from `001`.
4. Authentication → Users → create admin user (email + password).
5. Settings → API → copy **Project URL** and **anon key** into `.env.local`.
6. `npm run dev` → log in at `/admin/login` → upload studio image under About → add works to a project.

`.env.local` keys:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_UPLOAD_BUCKET=uploads
```

## GitHub + Vercel

Repo is initialized locally (`git init`). You:

1. Create an empty GitHub repository
2. `git remote add origin <url>`
3. Commit + push
4. Import the repo in Vercel and set the same env vars

## Sync kit from studio-core

```bash
./scripts/sync-core.sh
```

## What to personalize first

1. Connect Supabase (checklist above)
2. Confirm hero photos in `public/home/` (see `src/lib/home.ts`)
3. Replace placeholder **projects** titles/copy; add works + photos
4. Mode A: place works on canvas; Mode B: upload real note scans
5. About bio/contact; paintings

## Design notes (handwritten notes)

Prefer real scans/photos of the artist’s notes (PNG, clean or transparent background). Fake handwriting fonts will look wrong. Position with the Design B notes editor in admin.
