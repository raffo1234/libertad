-- Roles & permissions schema, plus a `user` table that mirrors auth.users.
-- Run this in the Supabase SQL editor.

-- ─── role ───────────────────────────────────────────────────────────────────
create table public.role (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- ─── permission ─────────────────────────────────────────────────────────────
create table public.permission (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- ─── role_permission (many-to-many) ────────────────────────────────────────
create table public.role_permission (
  role_id uuid not null references public.role(id) on delete cascade,
  permission_id uuid not null references public.permission(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- ─── user (mirrors auth.users, one role per user) ──────────────────────────
create table public."user" (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role_id uuid references public.role(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Backfill existing auth users.
insert into public."user" (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- Keep public.user in sync with new signups.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public."user" (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── RLS ────────────────────────────────────────────────────────────────────
-- Open to any authenticated user for now; tighten once role-based access is in place.
alter table public.role enable row level security;
alter table public.permission enable row level security;
alter table public.role_permission enable row level security;
alter table public."user" enable row level security;

create policy "Authenticated read role" on public.role
  for select to authenticated using (true);

create policy "Authenticated read permission" on public.permission
  for select to authenticated using (true);

create policy "Authenticated read role_permission" on public.role_permission
  for select to authenticated using (true);

create policy "Authenticated read user" on public."user"
  for select to authenticated using (true);

create policy "Authenticated update user role" on public."user"
  for update to authenticated using (true) with check (true);
