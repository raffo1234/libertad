-- Add the edit_lead_status permission and grant it to admin.

insert into public.permission (name, description) values
  ('edit_lead_status', 'Edit a lead''s status')
on conflict (name) do nothing;

insert into public.role_permission (role_id, permission_id)
select r.id, p.id
from public.role r
cross join public.permission p
where r.name = 'admin' and p.name = 'edit_lead_status'
on conflict do nothing;
