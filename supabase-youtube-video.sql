-- Run in Supabase SQL Editor to add one YouTube video per activity post.
-- Existing posts and images are preserved; safe to run again.
alter table public.posts add column if not exists video_uid text not null default '';
notify pgrst, 'reload schema';
