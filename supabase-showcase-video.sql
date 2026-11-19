alter table public.settings
  add column if not exists showcase_video_url text not null default '';
