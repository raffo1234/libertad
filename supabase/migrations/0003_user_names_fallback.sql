-- Google OAuth metadata usually only has full_name/name, not given_name/family_name.
-- Derive first/last name by splitting full_name on the first space.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  full_name text;
  space_pos int;
begin
  full_name := coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name');
  space_pos := position(' ' in coalesce(full_name, ''));

  insert into public."user" (id, email, first_name, last_name)
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
    )
  );
  return new;
end;
$$;

-- Backfill users that are still missing both names.
update public."user" u
set
  first_name = coalesce(
    m.raw_user_meta_data ->> 'given_name',
    case when position(' ' in coalesce(m.raw_user_meta_data ->> 'full_name', m.raw_user_meta_data ->> 'name', '')) > 0
      then substring(
        coalesce(m.raw_user_meta_data ->> 'full_name', m.raw_user_meta_data ->> 'name')
        from 1 for position(' ' in coalesce(m.raw_user_meta_data ->> 'full_name', m.raw_user_meta_data ->> 'name')) - 1
      )
      else coalesce(m.raw_user_meta_data ->> 'full_name', m.raw_user_meta_data ->> 'name')
    end
  ),
  last_name = coalesce(
    m.raw_user_meta_data ->> 'family_name',
    case when position(' ' in coalesce(m.raw_user_meta_data ->> 'full_name', m.raw_user_meta_data ->> 'name', '')) > 0
      then substring(
        coalesce(m.raw_user_meta_data ->> 'full_name', m.raw_user_meta_data ->> 'name')
        from position(' ' in coalesce(m.raw_user_meta_data ->> 'full_name', m.raw_user_meta_data ->> 'name')) + 1
      )
      else null
    end
  )
from auth.users m
where m.id = u.id
  and u.first_name is null
  and u.last_name is null;
