-- CV PDF URL on About (uploaded to Storage; public link on About page).

alter table site_settings
  add column if not exists cv_url text;
