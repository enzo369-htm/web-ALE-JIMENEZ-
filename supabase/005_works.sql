-- Works + carousel images. Links free-canvas items to works via work_id.

create table if not exists works (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  year text,
  medium text,
  cover_image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists work_images (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references works(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists works_project_id_idx on works (project_id);
create index if not exists work_images_work_id_idx on work_images (work_id);

alter table works enable row level security;
alter table work_images enable row level security;

create policy "Public read works"
  on works for select using (true);

create policy "Auth write works"
  on works for all to authenticated
  using (true) with check (true);

create policy "Public read work_images"
  on work_images for select using (true);

create policy "Auth write work_images"
  on work_images for all to authenticated
  using (true) with check (true);

-- Optional link from free-canvas items → works (Design A click → carousel)
alter table canvas_items
  add column if not exists work_id uuid references works(id) on delete set null;

create index if not exists canvas_items_work_id_idx on canvas_items (work_id);
