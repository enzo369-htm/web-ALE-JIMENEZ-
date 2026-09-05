-- Technical sheet image per work / painting (shown fixed under the piece in lightbox).

alter table works
  add column if not exists tech_sheet_url text;

alter table paintings
  add column if not exists tech_sheet_url text;
