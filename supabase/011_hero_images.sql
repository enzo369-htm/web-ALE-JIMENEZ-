-- Dual hero images for the public home (left / right panels).

alter table site_settings
  add column if not exists hero_left_image_url text;

alter table site_settings
  add column if not exists hero_right_image_url text;
