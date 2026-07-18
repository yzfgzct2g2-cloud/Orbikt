-- Repository SQL integration source. Run only against a disposable local Supabase database.
-- All rows are synthetic, use reserved example.test identities, and are rolled back.
begin;

do $$
declare actual text[];
begin
  select array_agg(e.enumlabel order by e.enumsortorder) into actual
  from pg_enum e join pg_type t on t.oid = e.enumtypid
  where t.typnamespace = 'public'::regnamespace and t.typname = 'tenant_role';
  if actual <> array['owner','admin','supervisor','case_manager'] then
    raise exception 'tenant_role contract mismatch';
  end if;
end $$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'user_profiles','user_security_states','tenant_workspaces','tenant_memberships',
    'permissions','role_permissions','user_permission_overrides','cases',
    'calendar_events','calendar_event_participants','notifications','audit_logs',
    'system_settings','tenant_settings','user_preferences'
  ] loop
    if not exists (
      select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = table_name and c.relrowsecurity
    ) then raise exception 'RLS missing for %', table_name; end if;
  end loop;
end $$;

-- Synthetic local Auth fixtures. This transaction never contacts or creates a Cloud Auth user.
insert into auth.users(id, email, aud, role, created_at, updated_at) values
  ('10000000-0000-4000-8000-000000000001', 'owner.a@login.example.test', 'authenticated', 'authenticated', now(), now()),
  ('10000000-0000-4000-8000-000000000002', 'readonly.a@login.example.test', 'authenticated', 'authenticated', now(), now()),
  ('20000000-0000-4000-8000-000000000001', 'owner.b@login.example.test', 'authenticated', 'authenticated', now(), now());

insert into public.user_profiles(user_id, username, display_name) values
  ('10000000-0000-4000-8000-000000000001', 'owner.a', 'Example Owner A'),
  ('10000000-0000-4000-8000-000000000002', 'readonly.a', 'Example Read Only A'),
  ('20000000-0000-4000-8000-000000000001', 'owner.b', 'Example Owner B');
insert into public.user_security_states(user_id, is_enabled, must_change_password) values
  ('10000000-0000-4000-8000-000000000001', true, false),
  ('10000000-0000-4000-8000-000000000002', true, false),
  ('20000000-0000-4000-8000-000000000001', true, false);
insert into public.tenant_workspaces(id, slug, name) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'example-tenant-a', 'Example Tenant A'),
  ('bbbbbbbb-0000-4000-8000-000000000001', 'example-tenant-b', 'Example Tenant B');
insert into public.tenant_memberships(id, tenant_workspace_id, user_id, role) values
  ('aaaaaaaa-1000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'owner'),
  ('aaaaaaaa-1000-4000-8000-000000000002', 'aaaaaaaa-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 'case_manager'),
  ('bbbbbbbb-1000-4000-8000-000000000001', 'bbbbbbbb-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'owner');
insert into public.user_permission_overrides(membership_id, tenant_workspace_id, permission_key, effect)
select 'aaaaaaaa-1000-4000-8000-000000000002', 'aaaaaaaa-0000-4000-8000-000000000001', permission_key, 'deny'
from public.permissions where permission_key in (
  'cases.create','cases.update_assigned','cases.delete_assigned',
  'calendar.create','calendar.update_own','calendar.delete_own'
);
insert into public.cases(id, tenant_workspace_id, case_code, display_name, created_by) values
  ('aaaaaaaa-2000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', 'TEST_A1', 'Synthetic Case A', '10000000-0000-4000-8000-000000000001'),
  ('bbbbbbbb-2000-4000-8000-000000000001', 'bbbbbbbb-0000-4000-8000-000000000001', 'TEST_B1', 'Synthetic Case B', '20000000-0000-4000-8000-000000000001');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

-- Workspace isolation: tenant A owner cannot see tenant B rows.
do $$ begin
  if (select count(*) from public.cases where id = 'bbbbbbbb-2000-4000-8000-000000000001') <> 0 then
    raise exception 'tenant isolation failed';
  end if;
end $$;

-- Canonical role permissions keep own/any boundaries explicit.
do $$ begin
  if not exists (select 1 from public.role_permissions where role = 'case_manager' and permission_key = 'calendar.update_own')
    or exists (select 1 from public.role_permissions where role = 'case_manager' and permission_key = 'calendar.update_any')
    or not exists (select 1 from public.role_permissions where role = 'supervisor' and permission_key = 'calendar.update_any') then
    raise exception 'permission matrix mismatch';
  end if;
end $$;

-- Cross-tenant insert must fail through RLS.
do $$ begin
  begin
    insert into public.cases(tenant_workspace_id, case_code, display_name, created_by)
    values ('bbbbbbbb-0000-4000-8000-000000000001', 'TEST_X1', 'Cross Tenant', auth.uid());
    raise exception 'cross-tenant insert unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
end $$;

-- Forced-password, disabled, and suspended states fail closed.
reset role;
select set_config('request.jwt.claim.sub', '', true);
update public.user_security_states set must_change_password = true where user_id = '10000000-0000-4000-8000-000000000002';
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
set local role authenticated;
do $$ begin
  if exists (select 1 from public.cases where tenant_workspace_id = 'aaaaaaaa-0000-4000-8000-000000000001') then
    raise exception 'forced-password restriction failed';
  end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub', '', true);
update public.user_security_states set must_change_password = false, is_enabled = false where user_id = '10000000-0000-4000-8000-000000000002';
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
set local role authenticated;
do $$ begin
  if exists (select 1 from public.cases where tenant_workspace_id = 'aaaaaaaa-0000-4000-8000-000000000001') then
    raise exception 'disabled-user restriction failed';
  end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub', '', true);
update public.user_security_states set is_enabled = true where user_id = '10000000-0000-4000-8000-000000000002';
update public.tenant_memberships set status = 'suspended' where id = 'aaaaaaaa-1000-4000-8000-000000000002';
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
set local role authenticated;
do $$ begin
  if exists (select 1 from public.cases where tenant_workspace_id = 'aaaaaaaa-0000-4000-8000-000000000001') then
    raise exception 'suspended-membership restriction failed';
  end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub', '', true);
update public.tenant_memberships set status = 'active' where id = 'aaaaaaaa-1000-4000-8000-000000000002';

-- Permission override composes read-only behavior without a Viewer role.
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
do $$ begin
  if (select count(*) from public.cases where tenant_workspace_id = 'aaaaaaaa-0000-4000-8000-000000000001') <> 1 then
    raise exception 'read-only permission lost read access';
  end if;
  begin
    insert into public.cases(tenant_workspace_id, case_code, display_name, created_by)
    values ('aaaaaaaa-0000-4000-8000-000000000001', 'TEST_A2', 'Denied Write', auth.uid());
    raise exception 'read-only permission allowed write';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
select set_config('request.jwt.claim.sub', '', true);

-- Unique membership and normalized username constraints.
do $$ begin
  begin
    insert into public.tenant_memberships(tenant_workspace_id, user_id, role)
    values ('aaaaaaaa-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'owner');
    raise exception 'unique membership constraint failed';
  exception when unique_violation then null; end;
  begin
    update public.user_profiles set username = 'Invalid Username' where user_id = '10000000-0000-4000-8000-000000000001';
    raise exception 'username constraint or immutability failed';
  exception when check_violation or insufficient_privilege then null; end;
end $$;

-- Foreign key tenant consistency: a tenant B participant cannot join a tenant A event.
insert into public.calendar_events(id, tenant_workspace_id, owner_user_id, title, starts_at, ends_at, created_by)
values ('aaaaaaaa-3000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Synthetic Event', now(), now() + interval '1 hour', '10000000-0000-4000-8000-000000000001');
do $$ begin
  begin
    insert into public.calendar_event_participants(event_id, tenant_workspace_id, user_id)
    values ('aaaaaaaa-3000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001');
    raise exception 'foreign key tenant consistency failed';
  exception when foreign_key_violation then null; end;
end $$;

-- Update row_version, soft delete visibility, and audit trigger.
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
set local role authenticated;
update public.cases set display_name = 'Synthetic Case A Updated' where id = 'aaaaaaaa-2000-4000-8000-000000000001';
do $$ begin
  if (select row_version from public.cases where id = 'aaaaaaaa-2000-4000-8000-000000000001') <> 2 then
    raise exception 'row_version update failed';
  end if;
  if not exists (select 1 from public.audit_logs where entity_type = 'cases' and entity_id = 'aaaaaaaa-2000-4000-8000-000000000001') then
    raise exception 'audit trigger failed';
  end if;
end $$;
update public.cases set deleted_at = now(), deleted_by = auth.uid() where id = 'aaaaaaaa-2000-4000-8000-000000000001';
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
do $$ begin
  if exists (select 1 from public.cases where id = 'aaaaaaaa-2000-4000-8000-000000000001') then
    raise exception 'soft delete visibility failed';
  end if;
end $$;

-- Audit logs remain append-only even for the trusted database role.
reset role;
select set_config('request.jwt.claim.sub', '', true);
do $$ begin
  begin
    update public.audit_logs set action = 'tampered' where entity_type = 'cases';
    raise exception 'audit update unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
end $$;

-- Delete cascade: deleting a synthetic membership removes its permission overrides.
delete from public.tenant_memberships where id = 'aaaaaaaa-1000-4000-8000-000000000002';
do $$ begin
  if exists (select 1 from public.user_permission_overrides where membership_id = 'aaaaaaaa-1000-4000-8000-000000000002') then
    raise exception 'delete cascade failed';
  end if;
end $$;

rollback;
