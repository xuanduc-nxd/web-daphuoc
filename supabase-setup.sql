-- Run in the SQL Editor of a dedicated Supabase project.
-- Existing legacy site_data and its contents are retained.
begin;

create table if not exists public.posts (
    id text primary key,
    legacy_id text,
    kind text not null check (kind in ('activity', 'notification', 'blog')),
    title text not null check (length(trim(title)) between 1 and 500),
    excerpt text not null default '',
    content text not null default '',
    content_format text not null default 'plain' check (content_format in ('plain', 'html')),
    image text not null default '',
    gallery jsonb not null default '[]'::jsonb,
    author text not null default '',
    role text not null default '',
    date date,
    status text not null default 'draft' check (status in ('draft', 'published')),
    pinned boolean not null default false,
    expires_on date,
    version integer not null default 1 check (version > 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (kind, legacy_id)
);
alter table public.posts add column if not exists gallery jsonb not null default '[]'::jsonb;
alter table public.posts add column if not exists pinned boolean not null default false;
alter table public.posts add column if not exists expires_on date;
create index if not exists posts_public_listing on public.posts (kind, status, date desc, id);

create table if not exists public.members (
    id text primary key,
    type text not null check (type in ('board', 'student')),
    name text not null check (length(trim(name)) between 1 and 200),
    position text not null default '',
    school text not null default '',
    major text not null default '',
    detail text not null default '',
    direction text not null default '',
    support_needs text not null default '',
    expertise text not null default '',
    image text not null default '',
    sort_order integer not null default 0,
    version integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
alter table public.members add column if not exists direction text not null default '';
alter table public.members add column if not exists support_needs text not null default '';
alter table public.members add column if not exists expertise text not null default '';
create index if not exists members_listing on public.members (type, sort_order, id);

create table if not exists public.sponsors (
    id text primary key,
    title text not null check (length(trim(title)) between 1 and 500),
    excerpt text not null default '',
    content text not null default '',
    image text not null default '',
    date date,
    sort_order integer not null default 0,
    version integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.about_sections (
    id text primary key,
    section_key text not null check (section_key in ('principle', 'scope', 'target', 'method')),
    category text not null default '',
    content text not null default '',
    sort_order integer not null default 0,
    version integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.settings (
    id text primary key check (id = 'main'),
    site_name text not null default 'CLB Golf Đa Phước',
    notice text not null default 'Đồng hành cùng thế hệ trẻ Đà Nẵng',
    contact text not null default '',
    phone text not null default '',
    email text not null default '',
    location text not null default 'Đà Nẵng, Việt Nam',
    facebook text not null default '',
    instagram text not null default '',
    tiktok text not null default '',
    threads text not null default '',
    hero_image text not null default '',
    version integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- PHP handles password verification and server sessions.
-- This table is private; it does not duplicate Supabase Auth users.
create table if not exists public.admin_users (
    id text primary key,
    username text not null unique check (username = lower(username) and username ~ '^[a-z0-9_.-]{3,64}$'),
    display_name text not null default '',
    password_hash text not null,
    role text not null default 'admin' check (role in ('admin', 'editor')),
    disabled boolean not null default false,
    version integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create or replace function public.touch_content_version()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
    new.created_at := old.created_at;
    new.updated_at := now();
    new.version := old.version + 1;
    return new;
end;
$$;
revoke all on function public.touch_content_version() from public, anon, authenticated;

do $$
declare t text;
begin
    foreach t in array array['posts','members','sponsors','about_sections','settings','admin_users'] loop
        execute format('alter table public.%I enable row level security', t);
        execute format('revoke all on public.%I from public, anon, authenticated', t);
        execute format('grant select, insert, update, delete on public.%I to service_role', t);
        if not exists (
            select 1 from pg_trigger
            where tgrelid = format('public.%I', t)::regclass and tgname = 'content_version'
        ) then
            execute format('create trigger content_version before update on public.%I for each row execute function public.touch_content_version()', t);
        end if;
    end loop;
end;
$$;

-- Shared login throttling survives PHP/container restarts.
create table if not exists public.admin_login_attempts (
    id text primary key,
    attempts integer not null default 0,
    window_start timestamptz not null default now()
);
alter table public.admin_login_attempts enable row level security;
revoke all on public.admin_login_attempts from public, anon, authenticated;
grant select, insert, update, delete on public.admin_login_attempts to service_role;

create or replace function public.consume_admin_login_attempt(attempt_key text)
returns boolean language plpgsql security definer set search_path = pg_catalog, public as $$
declare used integer;
begin
    if attempt_key !~ '^[a-f0-9]{64}$' then raise exception 'Invalid attempt key'; end if;
    delete from public.admin_login_attempts where window_start < now() - interval '1 day';
    insert into public.admin_login_attempts (id, attempts, window_start)
    values (attempt_key, 1, now())
    on conflict (id) do update set
        attempts = case when admin_login_attempts.window_start < now() - interval '15 minutes'
            then 1 else admin_login_attempts.attempts + 1 end,
        window_start = case when admin_login_attempts.window_start < now() - interval '15 minutes'
            then now() else admin_login_attempts.window_start end
    returning attempts into used;
    return used <= 10;
end;
$$;
revoke all on function public.consume_admin_login_attempt(text) from public, anon, authenticated;
grant execute on function public.consume_admin_login_attempt(text) to service_role;

-- Anonymous Blog submissions are sent by the server as drafts. Limit each
-- hashed client/address pair to three submissions in an hour, with a wider
-- network ceiling for visitors who share a proxy or public connection.
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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 20971520, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

notify pgrst, 'reload schema';
commit;
