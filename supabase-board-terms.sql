-- Run in Supabase SQL Editor before deploying the board-by-term page.
-- Profiles outside the three confirmed current members remain unassigned.
alter table public.members add column if not exists board_term text not null default '';
alter table public.members add column if not exists term_order integer not null default 0;
alter table public.members add column if not exists role_title text not null default '';
alter table public.settings add column if not exists current_board_label text not null default '';
-- These three existing profiles were confirmed as the current term.
update public.members set board_term = 'current'
where id in ('board_1', 'board_4', 'team_ac7e7b60bcfe6517')
  and type = 'board' and position = 'Ban điều hành' and board_term = '';
notify pgrst, 'reload schema';
