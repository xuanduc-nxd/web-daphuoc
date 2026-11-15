-- Run once in Supabase SQL Editor to add the public website photo album.
begin;

alter table public.settings
    add column if not exists gallery jsonb not null default '[]'::jsonb;

do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conrelid = 'public.settings'::regclass
          and conname = 'settings_gallery_valid'
    ) then
        alter table public.settings
            add constraint settings_gallery_valid
            check (jsonb_typeof(gallery) = 'array' and jsonb_array_length(gallery) <= 20);
    end if;
end;
$$;

notify pgrst, 'reload schema';
commit;
