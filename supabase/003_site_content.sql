-- Site-wide editable content (single row).
-- Safe for a NEW Supabase project.

create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  studio_image_url text,
  hero_left_image_url text,
  hero_right_image_url text,
  hero_full_image_url text,
  hero_layout text check (hero_layout is null or hero_layout in ('dual', 'single')),
  about_bio text,
  about_photo_url text,
  email text,
  instagram text,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

create policy "Public read site_settings"
  on site_settings for select using (true);

create policy "Auth write site_settings"
  on site_settings for all to authenticated
  using (true) with check (true);

insert into site_settings (id, about_bio, email, instagram)
values (
  1,
  'Alejandra Jimenez is an artist whose practice centers on painting. This site extends her studio — a place to wander through projects and selected works.',
  'hello@alejandrajimenez.example',
  'https://instagram.com/alejandrajimenez'
)
on conflict (id) do nothing;
