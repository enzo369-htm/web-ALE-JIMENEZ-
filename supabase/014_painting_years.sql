-- Year groups for selected paintings (list → free-canvas detail, like projects Mode A).

create table if not exists painting_years (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  year text,
  description text,
  sort_order int not null default 0,
  canvas_page_id uuid references canvas_pages (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists painting_years_sort_order_idx
  on painting_years (sort_order);

alter table painting_years enable row level security;

drop policy if exists "Public read painting_years" on painting_years;
create policy "Public read painting_years"
  on painting_years for select using (true);

drop policy if exists "Auth write painting_years" on painting_years;
create policy "Auth write painting_years"
  on painting_years for all to authenticated
  using (true) with check (true);

alter table paintings
  add column if not exists year_id uuid references painting_years (id) on delete cascade;

alter table paintings
  add column if not exists cover_image_url text;

create index if not exists paintings_year_id_idx on paintings (year_id);
