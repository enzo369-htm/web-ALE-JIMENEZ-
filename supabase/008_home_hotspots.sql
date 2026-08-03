-- Interactive home hero hotspots (SVG polygon points in 0–100 space).

create table if not exists home_hotspots (
  id uuid primary key default gen_random_uuid(),
  panel text not null check (panel in ('left', 'right')),
  label text not null,
  href text not null,
  object_note text,
  points text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists home_hotspots_panel_sort_idx
  on home_hotspots (panel, sort_order);

alter table home_hotspots enable row level security;

create policy "Public read home_hotspots"
  on home_hotspots for select using (true);

create policy "Auth write home_hotspots"
  on home_hotspots for all to authenticated
  using (true) with check (true);
