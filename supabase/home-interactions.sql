-- Run this once in Supabase Dashboard -> SQL Editor.
-- Also enable Authentication -> Providers -> Anonymous Sign-Ins.

create extension if not exists pgcrypto;

create table if not exists public.page_reactions (
  page_key text not null,
  visitor_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (page_key, visitor_id)
);

create table if not exists public.guestbook_comments (
  id uuid primary key default gen_random_uuid(),
  page_key text not null default 'home',
  visitor_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_name text not null default '一位访客' check (char_length(author_name) between 1 and 24),
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists guestbook_comments_page_created_at_idx
  on public.guestbook_comments (page_key, created_at desc);

grant usage on schema public to anon, authenticated;
grant select, insert, delete on public.page_reactions to authenticated;
grant select, insert on public.guestbook_comments to authenticated;

alter table public.page_reactions enable row level security;
alter table public.guestbook_comments enable row level security;

create or replace function public.get_page_reaction_count(target_page_key text)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*) from public.page_reactions where page_key = target_page_key;
$$;

create or replace function public.can_leave_guestbook_comment()
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.guestbook_comments
    where visitor_id = auth.uid()
      and created_at > now() - interval '30 seconds'
  );
$$;

revoke all on function public.get_page_reaction_count(text) from public;
grant execute on function public.get_page_reaction_count(text) to anon, authenticated;

revoke all on function public.can_leave_guestbook_comment() from public;
grant execute on function public.can_leave_guestbook_comment() to authenticated;

create policy "Authenticated visitors can read their own reaction"
  on public.page_reactions for select to authenticated
  using (visitor_id = auth.uid());

create policy "Authenticated visitors can add their own reaction"
  on public.page_reactions for insert to authenticated
  with check (visitor_id = auth.uid());

create policy "Authenticated visitors can remove their own reaction"
  on public.page_reactions for delete to authenticated
  using (visitor_id = auth.uid());

create policy "Authenticated visitors can read guestbook comments"
  on public.guestbook_comments for select to authenticated using (true);

create policy "Authenticated visitors can leave a guestbook comment"
  on public.guestbook_comments for insert to authenticated
  with check (
    visitor_id = auth.uid()
    and public.can_leave_guestbook_comment()
  );
