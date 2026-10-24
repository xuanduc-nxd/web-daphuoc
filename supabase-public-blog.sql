-- Run once in Supabase SQL Editor to allow moderated, anonymous Blog submissions.
-- Safe to run again. Visitors never get direct access to posts or this table.
begin;

create table if not exists public.public_blog_submission_attempts (
    id text primary key,
    attempts integer not null default 0,
    window_start timestamptz not null default now()
);
alter table public.public_blog_submission_attempts enable row level security;
revoke all on public.public_blog_submission_attempts from public, anon, authenticated;
grant select, insert, update, delete on public.public_blog_submission_attempts to service_role;

drop function if exists public.consume_public_blog_submission(text);
create or replace function public.consume_public_blog_submission(attempt_key text, network_key text)
returns boolean language plpgsql security definer set search_path = pg_catalog, public as $$
declare used integer;
begin
    if attempt_key !~ '^[a-f0-9]{64}$' or network_key !~ '^[a-f0-9]{64}$' then
        raise exception 'Invalid attempt key';
    end if;
    delete from public.public_blog_submission_attempts where window_start < now() - interval '1 day';
    insert into public.public_blog_submission_attempts (id, attempts, window_start)
    values (attempt_key, 1, now())
    on conflict (id) do update set
        attempts = case when public_blog_submission_attempts.window_start < now() - interval '1 hour'
            then 1 else public_blog_submission_attempts.attempts + 1 end,
        window_start = case when public_blog_submission_attempts.window_start < now() - interval '1 hour'
            then now() else public_blog_submission_attempts.window_start end
    returning attempts into used;
    if used > 3 then return false; end if;
    insert into public.public_blog_submission_attempts (id, attempts, window_start)
    values (network_key, 1, now())
    on conflict (id) do update set
        attempts = case when public_blog_submission_attempts.window_start < now() - interval '1 hour'
            then 1 else public_blog_submission_attempts.attempts + 1 end,
        window_start = case when public_blog_submission_attempts.window_start < now() - interval '1 hour'
            then now() else public_blog_submission_attempts.window_start end
    returning attempts into used;
    return used <= 30;
end;
$$;
revoke all on function public.consume_public_blog_submission(text, text) from public, anon, authenticated;
grant execute on function public.consume_public_blog_submission(text, text) to service_role;

notify pgrst, 'reload schema';
commit;
