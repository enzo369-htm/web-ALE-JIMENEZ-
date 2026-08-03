-- Projects domain (outside studio-core).
-- Requires 002_free_canvas_items.sql (canvas_pages).

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  year text,
  location text,
  description text,
  display_mode text not null default 'a' check (display_mode in ('a', 'b')),
  sort_order int not null default 0,
  canvas_page_id uuid references canvas_pages(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists projects_sort_order_idx on projects (sort_order);

alter table projects enable row level security;

create policy "Public read projects"
  on projects for select using (true);

create policy "Auth write projects"
  on projects for all to authenticated
  using (true) with check (true);

-- Seed four placeholder projects + canvas pages for mode A
do $$
declare
  p1 uuid;
  p2 uuid;
  p3 uuid;
  p4 uuid;
  c1 uuid;
  c2 uuid;
begin
  insert into canvas_pages (slug, title, height_ratio)
  values ('project-01', 'Project 01 canvas', 1.15)
  on conflict (slug) do update set title = excluded.title
  returning id into c1;

  if c1 is null then
    select id into c1 from canvas_pages where slug = 'project-01';
  end if;

  insert into canvas_pages (slug, title, height_ratio)
  values ('project-03', 'Project 03 canvas', 1.2)
  on conflict (slug) do update set title = excluded.title
  returning id into c2;

  if c2 is null then
    select id into c2 from canvas_pages where slug = 'project-03';
  end if;

  insert into projects (slug, title, year, location, description, display_mode, sort_order, canvas_page_id)
  values
    (
      'project-01',
      'threshold',
      '2025',
      'Buenos Aires',
      'A free composition of works arranged as they might sit across the studio wall.',
      'a',
      1,
      c1
    ),
    (
      'project-02',
      'night studies',
      '2024',
      'Lisbon',
      'A centered reading of a single work, surrounded by process notes from the studio.',
      'b',
      2,
      null
    ),
    (
      'project-03',
      'archipelago',
      '2024',
      'Germantown',
      'Scattered images and fragments in an open field of space.',
      'a',
      3,
      c2
    ),
    (
      'project-04',
      'soft geometry',
      '2023',
      'Paris',
      'Studio simulation: one painting held still, with handwritten thoughts at the edges.',
      'b',
      4,
      null
    )
  on conflict (slug) do nothing;
end $$;
