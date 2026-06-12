-- Allow users with the `manage_roles` permission to create/rename/delete roles
-- and grant/revoke permissions on them. Previously `role` and `role_permission`
-- only had SELECT policies, so writes were silently blocked by RLS.

create or replace function public.has_permission(permission_name text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public."user" u
    join public.role_permission rp on rp.role_id = u.role_id
    join public.permission p on p.id = rp.permission_id
    where u.id = auth.uid() and p.name = permission_name
  );
$$;

create policy "Manage roles insert" on public.role
  for insert to authenticated with check (public.has_permission('manage_roles'));

create policy "Manage roles update" on public.role
  for update to authenticated
  using (public.has_permission('manage_roles'))
  with check (public.has_permission('manage_roles'));

create policy "Manage roles delete" on public.role
  for delete to authenticated using (public.has_permission('manage_roles'));

create policy "Manage role_permission insert" on public.role_permission
  for insert to authenticated with check (public.has_permission('manage_roles'));

create policy "Manage role_permission delete" on public.role_permission
  for delete to authenticated using (public.has_permission('manage_roles'));
