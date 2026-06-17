-- Global key/value settings table + default role assignment on signup.

create table public.global_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

-- Seed the signup default role (null = no role assigned by default).
insert into public.global_settings (key, value) values
  ('signup_default_role', null);

-- RLS
alter table public.global_settings enable row level security;

create policy "Authenticated read global_settings" on public.global_settings
  for select to authenticated using (true);

create policy "Manage global_settings" on public.global_settings
  for update to authenticated
  using (public.has_permission('manage_roles'))
  with check (public.has_permission('manage_roles'));

-- Update trigger to assign default role on new signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  full_name text;
  space_pos int;
  default_role_id uuid;
begin
  full_name := coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name');
  space_pos := position(' ' in coalesce(full_name, ''));

  -- Look up the default role from global_settings.
  select value::uuid into default_role_id
  from public.global_settings
  where key = 'signup_default_role'
    and value is not null;

  insert into public."user" (id, email, first_name, last_name, role_id)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'given_name',
      case when space_pos > 0 then substring(full_name from 1 for space_pos - 1) else full_name end
    ),
    coalesce(
      new.raw_user_meta_data ->> 'family_name',
      case when space_pos > 0 then substring(full_name from space_pos + 1) else null end
    ),
    default_role_id
  );
  return new;
end;
$$;
