-- Generic free-canvas demo table (no artist/domain terms).
-- Safe to run on a NEW Supabase project. Do NOT run on production client DBs
-- unless you intend to add this table.

create table if not exists canvas_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null default 'demo',
  title text,
  height_ratio double precision not null default 1.2,
  created_at timestamptz not null default now()
);

create table if not exists canvas_items (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references canvas_pages(id) on delete cascade,
  image_url text not null,
  label text,
  x double precision not null default 10,
  y double precision not null default 10,
  width double precision not null default 24,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists canvas_items_page_id_idx on canvas_items(page_id);

alter table canvas_pages enable row level security;
alter table canvas_items enable row level security;

-- Public read
create policy "Public read canvas_pages"
  on canvas_pages for select using (true);

create policy "Public read canvas_items"
  on canvas_items for select using (true);

-- Authenticated write
create policy "Auth write canvas_pages"
  on canvas_pages for all to authenticated
  using (true) with check (true);

create policy "Auth write canvas_items"
  on canvas_items for all to authenticated
  using (true) with check (true);

-- Seed one demo page
insert into canvas_pages (slug, title, height_ratio)
values ('demo', 'Demo canvas', 1.2)
on conflict (slug) do nothing;
