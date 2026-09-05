-- Free-canvas for painting years (Design A, same as projects).

alter table painting_years
  add column if not exists year text;

alter table painting_years
  add column if not exists description text;

alter table painting_years
  add column if not exists canvas_page_id uuid references canvas_pages (id) on delete set null;

alter table paintings
  add column if not exists cover_image_url text;

alter table paintings
  alter column image_url drop not null;

update paintings
set cover_image_url = coalesce(cover_image_url, image_url)
where cover_image_url is null and image_url is not null;

create table if not exists painting_images (
  id uuid primary key default gen_random_uuid(),
  painting_id uuid not null references paintings (id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists painting_images_painting_id_idx
  on painting_images (painting_id);

alter table painting_images enable row level security;

drop policy if exists "Public read painting_images" on painting_images;
create policy "Public read painting_images"
  on painting_images for select using (true);

drop policy if exists "Auth write painting_images" on painting_images;
create policy "Auth write painting_images"
  on painting_images for all to authenticated
  using (true) with check (true);

-- Link free-canvas items → paintings (Design A click → lightbox)
alter table canvas_items
  add column if not exists painting_id uuid references paintings (id) on delete set null;

create index if not exists canvas_items_painting_id_idx on canvas_items (painting_id);
