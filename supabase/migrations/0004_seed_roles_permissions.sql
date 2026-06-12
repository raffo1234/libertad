-- Seed initial permissions and roles (admin / guest).

insert into public.permission (name, description) values
  ('view_users', 'View the users list'),
  ('edit_user_role', 'Change a user''s role'),
  ('view_leads', 'View leads'),
  ('create_leads', 'Create leads'),
  ('edit_leads', 'Edit leads'),
  ('delete_leads', 'Delete leads'),
  ('view_bitacora', 'View bitacora entries'),
  ('create_bitacora', 'Create bitacora entries'),
  ('edit_bitacora', 'Edit bitacora entries'),
  ('delete_bitacora', 'Delete bitacora entries'),
  ('view_roles', 'View roles and permissions'),
  ('manage_roles', 'Create, edit and delete roles')
on conflict (name) do nothing;

insert into public.role (name) values ('admin'), ('guest')
on conflict (name) do nothing;

-- admin gets every permission
insert into public.role_permission (role_id, permission_id)
select r.id, p.id
from public.role r
cross join public.permission p
where r.name = 'admin'
on conflict do nothing;

-- bootstrap: make the current developer an admin so /crm/users and
-- /crm/roles remain accessible once permission gating ships.
update public."user"
set role_id = (select id from public.role where name = 'admin')
where email = 'estarencasainfo@gmail.com';
