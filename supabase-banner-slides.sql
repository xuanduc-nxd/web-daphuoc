-- Four additional banner images on each page; the existing banner image is slide one.
alter table public.settings
  add column if not exists banner_slides jsonb not null default '[]'::jsonb,
  add column if not exists about_banner_slides jsonb not null default '[]'::jsonb;
alter table public.settings drop constraint if exists settings_banner_slides_limit;
alter table public.settings add constraint settings_banner_slides_limit
  check (jsonb_typeof(banner_slides) = 'array' and jsonb_array_length(banner_slides) <= 4);
alter table public.settings drop constraint if exists settings_about_banner_slides_limit;
alter table public.settings add constraint settings_about_banner_slides_limit
  check (jsonb_typeof(about_banner_slides) = 'array' and jsonb_array_length(about_banner_slides) <= 4);
notify pgrst, 'reload schema';
