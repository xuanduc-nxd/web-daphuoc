-- Add the public student profile fields to an existing Supabase project.
-- Safe to rerun; existing rows receive empty values for new fields.
alter table public.members add column if not exists direction text not null default '';
alter table public.members add column if not exists support_needs text not null default '';
alter table public.members add column if not exists expertise text not null default '';
notify pgrst, 'reload schema';
