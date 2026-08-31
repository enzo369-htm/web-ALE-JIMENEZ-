-- Remove Sounds section (no longer part of the site).
drop policy if exists "Public read sounds" on sounds;
drop policy if exists "Auth write sounds" on sounds;
drop table if exists sounds;
