-- Texts published on the site (title, short excerpt, full body).

create table if not exists texts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text not null,
  published_at date,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists texts_sort_order_idx on texts (sort_order);

alter table texts enable row level security;

drop policy if exists "Public read texts" on texts;
create policy "Public read texts"
  on texts for select using (true);

drop policy if exists "Auth write texts" on texts;
create policy "Auth write texts"
  on texts for all to authenticated
  using (true) with check (true);
