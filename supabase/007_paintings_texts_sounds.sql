-- Selected paintings, Substack texts, and sounds.

create table if not exists paintings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year text,
  medium text,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists texts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text,
  substack_url text not null,
  embed_html text,
  published_at date,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists sounds (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  audio_url text not null,
  cover_image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists paintings_sort_order_idx on paintings (sort_order);
create index if not exists texts_sort_order_idx on texts (sort_order);
create index if not exists sounds_sort_order_idx on sounds (sort_order);

alter table paintings enable row level security;
alter table texts enable row level security;
alter table sounds enable row level security;

create policy "Public read paintings"
  on paintings for select using (true);

create policy "Auth write paintings"
  on paintings for all to authenticated
  using (true) with check (true);

create policy "Public read texts"
  on texts for select using (true);

create policy "Auth write texts"
  on texts for all to authenticated
  using (true) with check (true);

create policy "Public read sounds"
  on sounds for select using (true);

create policy "Auth write sounds"
  on sounds for all to authenticated
  using (true) with check (true);

insert into texts (title, excerpt, substack_url, published_at, sort_order)
select * from (values
  (
    'On looking slowly',
    'A short note on attention, light, and the pace of making. Read the full essay on Substack.',
    'https://substack.com',
    '2025-03-12'::date,
    1
  ),
  (
    'Studio diary — winter',
    'Fragments from the wall: materials, weather, and unfinished thoughts.',
    'https://substack.com',
    '2024-11-02'::date,
    2
  )
) as v(title, excerpt, substack_url, published_at, sort_order)
where not exists (select 1 from texts limit 1);
