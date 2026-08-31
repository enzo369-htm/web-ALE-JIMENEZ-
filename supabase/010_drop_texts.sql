-- Remove Texts section (no longer part of the site).
drop policy if exists "Public read texts" on texts;
drop policy if exists "Auth write texts" on texts;
drop table if exists texts;
