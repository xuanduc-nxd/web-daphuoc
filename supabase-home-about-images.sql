-- Add independent background and central images for Home and About.
-- Safe to run repeatedly; existing About background starts with the current Home background.
alter table public.settings add column if not exists banner_image text not null default 'assets/images/hero-clb.jpg';
do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'settings' and column_name = 'about_banner_image'
    ) then
        alter table public.settings add column about_banner_image text not null default '';
        update public.settings set about_banner_image = banner_image;
        alter table public.settings alter column about_banner_image set default 'assets/images/hero-clb.jpg';
    end if;
end;
$$;
alter table public.settings add column if not exists about_hero_image text not null default 'Image/act-1.jpg';
notify pgrst, 'reload schema';
