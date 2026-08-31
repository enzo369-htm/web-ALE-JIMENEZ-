-- Selected paintings gallery.

create table if not exists paintings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year text,
  medium text,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists paintings_sort_order_idx on paintings (sort_order);

alter table paintings enable row level security;

create policy "Public read paintings"
  on paintings for select using (true);

create policy "Auth write paintings"
  on paintings for all to authenticated
  using (true) with check (true);
