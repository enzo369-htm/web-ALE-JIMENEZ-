-- Handwritten / scanned notes for Design B (studio wall).

create table if not exists project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  image_url text not null,
  x double precision not null default 10,
  y double precision not null default 10,
  width double precision not null default 18,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_notes_project_id_idx on project_notes (project_id);

alter table project_notes enable row level security;

create policy "Public read project_notes"
  on project_notes for select using (true);

create policy "Auth write project_notes"
  on project_notes for all to authenticated
  using (true) with check (true);
