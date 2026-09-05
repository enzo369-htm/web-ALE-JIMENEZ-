-- Notes attached per work / painting (shown only in lightbox).
-- Unifies former Studio Wall notes into free-canvas + per-work notes.

create table if not exists work_notes (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references works (id) on delete cascade,
  image_url text not null,
  x double precision not null default 10,
  y double precision not null default 10,
  width double precision not null default 18,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists work_notes_work_id_idx on work_notes (work_id);

alter table work_notes enable row level security;

drop policy if exists "Public read work_notes" on work_notes;
create policy "Public read work_notes"
  on work_notes for select using (true);

drop policy if exists "Auth write work_notes" on work_notes;
create policy "Auth write work_notes"
  on work_notes for all to authenticated
  using (true) with check (true);

create table if not exists painting_notes (
  id uuid primary key default gen_random_uuid(),
  painting_id uuid not null references paintings (id) on delete cascade,
  image_url text not null,
  x double precision not null default 10,
  y double precision not null default 10,
  width double precision not null default 18,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists painting_notes_painting_id_idx on painting_notes (painting_id);

alter table painting_notes enable row level security;

drop policy if exists "Public read painting_notes" on painting_notes;
create policy "Public read painting_notes"
  on painting_notes for select using (true);

drop policy if exists "Auth write painting_notes" on painting_notes;
create policy "Auth write painting_notes"
  on painting_notes for all to authenticated
  using (true) with check (true);

-- Force all projects onto free canvas (former Mode A).
update projects set display_mode = 'a' where display_mode is distinct from 'a';

-- Ensure every project has a canvas page.
do $$
declare
  r record;
  new_page_id uuid;
begin
  for r in
    select id, slug, title
    from projects
    where canvas_page_id is null
  loop
    insert into canvas_pages (slug, title, height_ratio)
    values (
      'project-' || r.slug || '-' || substr(r.id::text, 1, 8),
      coalesce(r.title, r.slug) || ' canvas',
      1.15
    )
    returning id into new_page_id;

    update projects
    set canvas_page_id = new_page_id
    where id = r.id;
  end loop;
end $$;

-- Ensure every painting year has a canvas page (public + admin).
do $$
declare
  r record;
  new_page_id uuid;
begin
  for r in
    select id, slug, title
    from painting_years
    where canvas_page_id is null
  loop
    insert into canvas_pages (slug, title, height_ratio)
    values (
      'paintings-' || r.slug || '-' || substr(r.id::text, 1, 8),
      coalesce(r.title, r.slug) || ' canvas',
      1.15
    )
    returning id into new_page_id;

    update painting_years
    set canvas_page_id = new_page_id
    where id = r.id;
  end loop;
end $$;
