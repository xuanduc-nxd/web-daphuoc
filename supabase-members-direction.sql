-- Run once in Supabase SQL Editor if the existing members table predates student direction.
alter table public.members add column if not exists direction text not null default '';
notify pgrst, 'reload schema';
