-- Apply once in the Supabase SQL Editor for an existing project.
-- This preserves existing posts and can be run again safely.
begin;

alter table public.posts add column if not exists gallery jsonb not null default '[]'::jsonb;
alter table public.posts add column if not exists pinned boolean not null default false;
alter table public.posts add column if not exists expires_on date;

commit;
