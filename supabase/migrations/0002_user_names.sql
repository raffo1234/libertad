-- Add first/last name to public.user, populated from auth provider metadata.

alter table public."user"
  add column first_name text,
  add column last_name text;

-- Backfill from existing auth metadata (Google OAuth: given_name / family_name).
update public."user" u
set first_name = m.raw_user_meta_data ->> 'given_name',
    last_name = m.raw_user_meta_data ->> 'family_name'
from auth.users m
where m.id = u.id;

-- Keep new signups in sync with their name too.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public."user" (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'given_name',
    new.raw_user_meta_data ->> 'family_name'
  );
  return new;
end;
$$;
