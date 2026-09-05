-- Technical sheet text per work / painting (fixed under the piece in lightbox).

alter table works
  add column if not exists tech_sheet_text text;

alter table paintings
  add column if not exists tech_sheet_text text;

-- Drop image column if it was added earlier.
alter table works
  drop column if exists tech_sheet_url;

alter table paintings
  drop column if exists tech_sheet_url;
