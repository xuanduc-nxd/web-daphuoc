-- Run once in Supabase SQL Editor before using the new branding controls in admin.
-- Existing website name and showcase image are preserved.
alter table public.settings add column if not exists header_label text not null default 'Quỹ học bổng';
alter table public.settings add column if not exists header_title text not null default 'CLB GOLF ĐA PHƯỚC VÀ NHỮNG NGƯỜI BẠN';
alter table public.settings add column if not exists banner_image text not null default 'assets/images/hero-clb.jpg';
notify pgrst, 'reload schema';
