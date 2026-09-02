-- Full-bleed single hero image + layout mode (dual | single).

alter table site_settings
  add column if not exists hero_full_image_url text;

alter table site_settings
  add column if not exists hero_layout text
  check (hero_layout is null or hero_layout in ('dual', 'single'));

update site_settings
set hero_layout = coalesce(hero_layout, 'dual')
where id = 1;
