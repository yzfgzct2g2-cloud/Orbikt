begin;

create schema if not exists private;

do $$ begin
  create type public.tenant_role as enum ('owner', 'admin', 'supervisor', 'case_manager');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.membership_status as enum ('active', 'suspended');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.permission_effect as enum ('allow', 'deny');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.calendar_event_source as enum ('manual', 'system');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.calendar_event_status as enum ('scheduled', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null check (char_length(display_name) between 1 and 100),
  job_title text,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  updated_by uuid references auth.users(id) on delete set null,
  row_version bigint not null default 1 check (row_version > 0),
  constraint user_profiles_username_format check (
    char_length(username) between 3 and 32
    and username = lower(btrim(username))
    and username ~ '^[a-z0-9]+([._-][a-z0-9]+)*$'
  )
);

create table if not exists public.user_security_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_enabled boolean not null default true,
  must_change_password boolean not null default true,
  password_change_required_at timestamptz,
  account_locked_at timestamptz,
  account_lock_reason text,
  reset_operation_id uuid,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  row_version bigint not null default 1 check (row_version > 0),
  constraint user_security_lock_consistency check (
    (account_locked_at is null and account_lock_reason is null)
    or (account_locked_at is not null and account_lock_reason is not null)
  )
);

create table if not exists public.tenant_workspaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+([_-][a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 120),
  created_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  updated_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  row_version bigint not null default 1 check (row_version > 0)
);

create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_workspace_id uuid not null references public.tenant_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.tenant_role not null,
  status public.membership_status not null default 'active',
  created_at timestamptz not null default statement_timestamp(),
  created_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default statement_timestamp(),
  updated_by uuid references auth.users(id) on delete set null,
  row_version bigint not null default 1 check (row_version > 0),
  unique (tenant_workspace_id, user_id),
  unique (tenant_workspace_id, user_id, id),
  unique (id, tenant_workspace_id)
);

create table if not exists public.permissions (
  permission_key text primary key check (permission_key ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'),
  description text not null check (char_length(description) between 1 and 240)
);

create table if not exists public.role_permissions (
  role public.tenant_role not null,
  permission_key text not null references public.permissions(permission_key) on delete cascade,
  primary key (role, permission_key)
);

create table if not exists public.user_permission_overrides (
  membership_id uuid not null,
  tenant_workspace_id uuid not null,
  permission_key text not null references public.permissions(permission_key) on delete cascade,
  effect public.permission_effect not null,
  created_at timestamptz not null default statement_timestamp(),
  created_by uuid references auth.users(id) on delete set null,
  primary key (membership_id, permission_key),
  foreign key (membership_id, tenant_workspace_id)
    references public.tenant_memberships(id, tenant_workspace_id) on delete cascade
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  tenant_workspace_id uuid not null references public.tenant_workspaces(id) on delete cascade,
  case_code text not null check (case_code ~ '^[A-Z0-9][A-Z0-9_-]{2,31}$'),
  display_name text not null check (char_length(display_name) between 1 and 120),
  assigned_user_id uuid,
  created_at timestamptz not null default statement_timestamp(),
  created_by uuid references auth.users(id) on delete restrict,
  updated_at timestamptz not null default statement_timestamp(),
  updated_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  row_version bigint not null default 1 check (row_version > 0),
  unique (tenant_workspace_id, case_code),
  unique (id, tenant_workspace_id),
  foreign key (tenant_workspace_id, assigned_user_id)
    references public.tenant_memberships(tenant_workspace_id, user_id) on delete restrict
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  tenant_workspace_id uuid not null references public.tenant_workspaces(id) on delete cascade,
  case_id uuid,
  owner_user_id uuid,
  title text not null check (char_length(title) between 1 and 160),
  description text check (char_length(description) <= 2000),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  source public.calendar_event_source not null default 'manual',
  source_reference text,
  status public.calendar_event_status not null default 'scheduled',
  created_at timestamptz not null default statement_timestamp(),
  created_by uuid references auth.users(id) on delete restrict,
  updated_at timestamptz not null default statement_timestamp(),
  updated_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  row_version bigint not null default 1 check (row_version > 0),
  constraint calendar_events_time_order check (ends_at > starts_at),
  constraint calendar_events_source_reference check (
    (source = 'manual' and source_reference is null)
    or (source = 'system' and source_reference is not null)
  ),
  foreign key (case_id, tenant_workspace_id)
    references public.cases(id, tenant_workspace_id) on delete restrict,
  foreign key (tenant_workspace_id, owner_user_id)
    references public.tenant_memberships(tenant_workspace_id, user_id) on delete restrict,
  unique (id, tenant_workspace_id)
);

create table if not exists public.calendar_event_participants (
  event_id uuid not null,
  tenant_workspace_id uuid not null,
  user_id uuid not null,
  created_at timestamptz not null default statement_timestamp(),
  created_by uuid references auth.users(id) on delete set null,
  primary key (event_id, user_id),
  foreign key (event_id, tenant_workspace_id)
    references public.calendar_events(id, tenant_workspace_id) on delete cascade,
  foreign key (tenant_workspace_id, user_id)
    references public.tenant_memberships(tenant_workspace_id, user_id) on delete cascade
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_workspace_id uuid not null references public.tenant_workspaces(id) on delete cascade,
  recipient_user_id uuid not null,
  category text not null check (category ~ '^[a-z][a-z0-9_]{1,39}$'),
  priority smallint not null default 0 check (priority between 0 and 3),
  summary text not null check (char_length(summary) between 1 and 240),
  source text not null check (char_length(source) between 1 and 80),
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default statement_timestamp(),
  created_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default statement_timestamp(),
  updated_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  row_version bigint not null default 1 check (row_version > 0),
  foreign key (tenant_workspace_id, recipient_user_id)
    references public.tenant_memberships(tenant_workspace_id, user_id) on delete cascade
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  tenant_workspace_id uuid not null references public.tenant_workspaces(id) on delete restrict,
  actor_user_id uuid,
  action text not null check (action ~ '^[a-z][a-z0-9_]{1,79}$'),
  entity_type text not null check (char_length(entity_type) between 1 and 80),
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz not null default statement_timestamp()
);

create table if not exists public.system_settings (
  setting_key text primary key check (setting_key ~ '^[a-z][a-z0-9_]{1,79}$'),
  setting_value jsonb not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default statement_timestamp(),
  updated_by uuid references auth.users(id) on delete set null,
  row_version bigint not null default 1 check (row_version > 0),
  constraint system_settings_alias_domain_format check (
    setting_key <> 'auth_alias_domain'
    or (
      is_public
      and jsonb_typeof(setting_value) = 'string'
      and (setting_value #>> '{}') = lower(setting_value #>> '{}')
      and char_length(setting_value #>> '{}') between 3 and 253
      and (setting_value #>> '{}') ~ '^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$'
      and (setting_value #>> '{}') like '%.%'
    )
  )
);

create table if not exists public.tenant_settings (
  tenant_workspace_id uuid not null references public.tenant_workspaces(id) on delete cascade,
  setting_key text not null check (setting_key ~ '^[a-z][a-z0-9_]{1,79}$'),
  setting_value jsonb not null,
  updated_at timestamptz not null default statement_timestamp(),
  updated_by uuid references auth.users(id) on delete set null,
  row_version bigint not null default 1 check (row_version > 0),
  primary key (tenant_workspace_id, setting_key)
);

create table if not exists public.user_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  preference_key text not null check (preference_key ~ '^[a-z][a-z0-9_]{1,79}$'),
  preference_value jsonb not null,
  updated_at timestamptz not null default statement_timestamp(),
  row_version bigint not null default 1 check (row_version > 0),
  primary key (user_id, preference_key)
);

insert into public.permissions(permission_key, description) values
  ('workspace.read', 'Read an Organization Workspace'),
  ('workspace.manage', 'Update an Organization Workspace'),
  ('workspace.delete', 'Soft-delete an Organization Workspace'),
  ('workspace.restore', 'Restore a soft-deleted Organization Workspace'),
  ('members.read', 'Read tenant membership records'),
  ('members.manage', 'Create and update tenant memberships'),
  ('members.assign_owner', 'Assign or remove tenant ownership'),
  ('profiles.read', 'Read profiles sharing an active tenant'),
  ('profiles.manage', 'Manage profiles sharing an active tenant'),
  ('cases.read', 'Read active tenant cases'),
  ('cases.create', 'Create a tenant case'),
  ('cases.update_assigned', 'Update an assigned tenant case'),
  ('cases.update_any', 'Update any tenant case'),
  ('cases.delete_assigned', 'Soft-delete an assigned tenant case'),
  ('cases.delete_any', 'Soft-delete any tenant case'),
  ('cases.restore', 'Restore soft-deleted tenant cases'),
  ('calendar.read', 'Read active tenant calendar events'),
  ('calendar.create', 'Create a manual tenant calendar event'),
  ('calendar.update_own', 'Update an owned manual calendar event'),
  ('calendar.update_any', 'Update any manual calendar event'),
  ('calendar.delete_own', 'Soft-delete an owned manual calendar event'),
  ('calendar.delete_any', 'Soft-delete any manual calendar event'),
  ('calendar.restore', 'Read and restore soft-deleted calendar events'),
  ('notifications.read', 'Read tenant notifications'),
  ('audit.read', 'Read sanitized tenant audit records'),
  ('settings.read', 'Read tenant settings'),
  ('settings.manage', 'Manage tenant settings')
on conflict (permission_key) do update set description = excluded.description;

insert into public.role_permissions(role, permission_key)
select role_value, permission_key
from (
  values
    ('owner'::public.tenant_role, array['workspace.read','workspace.manage','workspace.delete','workspace.restore','members.read','members.manage','members.assign_owner','profiles.read','profiles.manage','cases.read','cases.create','cases.update_assigned','cases.update_any','cases.delete_assigned','cases.delete_any','cases.restore','calendar.read','calendar.create','calendar.update_own','calendar.update_any','calendar.delete_own','calendar.delete_any','calendar.restore','notifications.read','audit.read','settings.read','settings.manage']::text[]),
    ('admin'::public.tenant_role, array['workspace.read','workspace.manage','workspace.restore','members.read','members.manage','profiles.read','profiles.manage','cases.read','cases.create','cases.update_assigned','cases.update_any','cases.delete_assigned','cases.delete_any','cases.restore','calendar.read','calendar.create','calendar.update_own','calendar.update_any','calendar.delete_own','calendar.delete_any','calendar.restore','notifications.read','audit.read','settings.read','settings.manage']::text[]),
    ('supervisor'::public.tenant_role, array['workspace.read','members.read','profiles.read','cases.read','cases.create','cases.update_assigned','cases.update_any','cases.delete_assigned','cases.delete_any','cases.restore','calendar.read','calendar.create','calendar.update_own','calendar.update_any','calendar.delete_own','calendar.delete_any','calendar.restore','notifications.read','audit.read','settings.read']::text[]),
    ('case_manager'::public.tenant_role, array['workspace.read','members.read','profiles.read','cases.read','cases.create','cases.update_assigned','cases.delete_assigned','calendar.read','calendar.create','calendar.update_own','calendar.delete_own','notifications.read','settings.read']::text[])
) as mapping(role_value, permission_keys)
cross join unnest(mapping.permission_keys) as permission_key
on conflict do nothing;

create or replace function private.current_user_is_enabled()
returns boolean language sql stable security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.user_security_states s
    where s.user_id = auth.uid()
      and s.is_enabled
      and not s.must_change_password
      and s.account_locked_at is null
  );
$$;

create or replace function private.has_permission(p_tenant_workspace_id uuid, p_permission_key text)
returns boolean language sql stable security definer
set search_path = pg_catalog, public
as $$
  select private.current_user_is_enabled() and exists (
    select 1
    from public.tenant_memberships m
    where m.tenant_workspace_id = p_tenant_workspace_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and not exists (
        select 1 from public.user_permission_overrides o
        where o.membership_id = m.id
          and o.permission_key = p_permission_key
          and o.effect = 'deny'
      )
      and (
        exists (
          select 1 from public.user_permission_overrides o
          where o.membership_id = m.id
            and o.permission_key = p_permission_key
            and o.effect = 'allow'
        )
        or exists (
          select 1 from public.role_permissions rp
          where rp.role = m.role and rp.permission_key = p_permission_key
        )
      )
  );
$$;

create or replace function private.touch_versioned_record()
returns trigger language plpgsql
set search_path = pg_catalog, public
as $$ begin
  new := jsonb_populate_record(
    new,
    jsonb_build_object(
      'updated_at', statement_timestamp(),
      'updated_by', auth.uid(),
      'row_version', old.row_version + 1
    )
  );
  return new;
end $$;

create or replace function private.stamp_created_record()
returns trigger language plpgsql
set search_path = pg_catalog
as $$
begin
  if auth.uid() is not null then
    new := jsonb_populate_record(
      new,
      jsonb_build_object('created_at', statement_timestamp(), 'created_by', auth.uid(), 'row_version', 1)
    );
  end if;
  return new;
end $$;

create or replace function private.prevent_username_change()
returns trigger language plpgsql
set search_path = pg_catalog, public
as $$ begin
  if new.username is distinct from old.username then
    raise exception using errcode = '42501', message = 'username is immutable';
  end if;
  return new;
end $$;

create or replace function private.guard_immutable_columns()
returns trigger language plpgsql
set search_path = pg_catalog
as $$
begin
  if (to_jsonb(new) -> 'id') is distinct from (to_jsonb(old) -> 'id')
    or (to_jsonb(new) -> 'user_id') is distinct from (to_jsonb(old) -> 'user_id')
    or (to_jsonb(new) -> 'tenant_workspace_id') is distinct from (to_jsonb(old) -> 'tenant_workspace_id')
    or (to_jsonb(new) -> 'membership_id') is distinct from (to_jsonb(old) -> 'membership_id')
    or (to_jsonb(new) -> 'permission_key') is distinct from (to_jsonb(old) -> 'permission_key')
    or (to_jsonb(new) -> 'setting_key') is distinct from (to_jsonb(old) -> 'setting_key')
    or (to_jsonb(new) -> 'preference_key') is distinct from (to_jsonb(old) -> 'preference_key')
    or (to_jsonb(new) -> 'event_id') is distinct from (to_jsonb(old) -> 'event_id')
    or (to_jsonb(new) -> 'created_at') is distinct from (to_jsonb(old) -> 'created_at')
    or (to_jsonb(new) -> 'created_by') is distinct from (to_jsonb(old) -> 'created_by') then
    raise exception using errcode = '42501', message = 'immutable record identity cannot change';
  end if;
  return new;
end $$;

create or replace function private.guard_membership_mutation()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare tenant_id uuid; target_user uuid; old_role public.tenant_role; new_role public.tenant_role;
begin
  if auth.uid() is null then if tg_op = 'DELETE' then return old; else return new; end if; end if;
  if tg_op = 'INSERT' then
    tenant_id := new.tenant_workspace_id; target_user := new.user_id; old_role := null; new_role := new.role;
  elsif tg_op = 'DELETE' then
    tenant_id := old.tenant_workspace_id; target_user := old.user_id; old_role := old.role; new_role := null;
  else
    tenant_id := new.tenant_workspace_id; target_user := new.user_id; old_role := old.role; new_role := new.role;
  end if;
  if target_user = auth.uid() and (tg_op <> 'UPDATE' or new.role is distinct from old.role or new.status is distinct from old.status) then
    raise exception using errcode = '42501', message = 'self membership mutation is not allowed';
  end if;
  if (old_role = 'owner' or new_role = 'owner') and not private.has_permission(tenant_id, 'members.assign_owner') then
    raise exception using errcode = '42501', message = 'owner assignment permission required';
  end if;
  if old_role = 'owner' and (tg_op = 'DELETE' or new_role <> 'owner' or new.status <> 'active') and not exists (
    select 1 from public.tenant_memberships m
    where m.tenant_workspace_id = tenant_id and m.role = 'owner' and m.status = 'active' and m.id <> old.id
  ) then
    raise exception using errcode = '23514', message = 'tenant must retain an active owner';
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end $$;

create or replace function private.guard_permission_override()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare target_user uuid; target_role public.tenant_role; tenant_id uuid; key_name text; effect_value public.permission_effect;
begin
  if auth.uid() is null then if tg_op = 'DELETE' then return old; else return new; end if; end if;
  if tg_op = 'DELETE' then
    tenant_id := old.tenant_workspace_id; key_name := old.permission_key; effect_value := old.effect;
    select m.user_id, m.role into target_user, target_role from public.tenant_memberships m where m.id = old.membership_id;
  else
    tenant_id := new.tenant_workspace_id; key_name := new.permission_key; effect_value := new.effect;
    select m.user_id, m.role into target_user, target_role from public.tenant_memberships m where m.id = new.membership_id;
  end if;
  if target_user = auth.uid() then
    raise exception using errcode = '42501', message = 'self permission override is not allowed';
  end if;
  if target_role = 'owner' and not private.has_permission(tenant_id, 'members.assign_owner') then
    raise exception using errcode = '42501', message = 'owner permission overrides require owner-assignment authority';
  end if;
  if effect_value = 'allow' and not private.has_permission(tenant_id, key_name) then
    raise exception using errcode = '42501', message = 'cannot grant a permission the caller does not have';
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end $$;

create or replace function private.guard_soft_delete_transition()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare tenant_id uuid;
begin
  tenant_id := coalesce(
    nullif(to_jsonb(new) ->> 'tenant_workspace_id', '')::uuid,
    nullif(to_jsonb(new) ->> 'id', '')::uuid
  );
  if old.deleted_at is null and new.deleted_at is not null and not private.has_permission(tenant_id, tg_argv[0]) then
    raise exception using errcode = '42501', message = 'soft-delete permission required';
  end if;
  if old.deleted_at is not null and new.deleted_at is null and not private.has_permission(tenant_id, tg_argv[1]) then
    raise exception using errcode = '42501', message = 'restore permission required';
  end if;
  if old.deleted_at is null and new.deleted_at is not null then
    new := jsonb_populate_record(new, jsonb_build_object('deleted_at', statement_timestamp(), 'deleted_by', auth.uid()));
  elsif old.deleted_at is not null and new.deleted_at is null then
    new := jsonb_populate_record(new, jsonb_build_object('deleted_at', null, 'deleted_by', null));
  end if;
  return new;
end $$;

create or replace function private.guard_scoped_soft_delete_transition()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare tenant_id uuid; scoped_user_id uuid; delete_allowed boolean;
begin
  tenant_id := (to_jsonb(new) ->> 'tenant_workspace_id')::uuid;
  scoped_user_id := nullif(to_jsonb(new) ->> tg_argv[3], '')::uuid;
  if old.deleted_at is null and new.deleted_at is not null then
    delete_allowed := (
      scoped_user_id = auth.uid() and private.has_permission(tenant_id, tg_argv[0])
    ) or private.has_permission(tenant_id, tg_argv[1]);
    if not delete_allowed then
      raise exception using errcode = '42501', message = 'scoped soft-delete permission required';
    end if;
    new := jsonb_populate_record(new, jsonb_build_object('deleted_at', statement_timestamp(), 'deleted_by', auth.uid()));
  elsif old.deleted_at is not null and new.deleted_at is null then
    if not private.has_permission(tenant_id, tg_argv[2]) then
      raise exception using errcode = '42501', message = 'restore permission required';
    end if;
    new := jsonb_populate_record(new, jsonb_build_object('deleted_at', null, 'deleted_by', null));
  end if;
  return new;
end $$;

create or replace function private.capture_audit_event()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare source_row jsonb; tenant_id uuid; record_id uuid;
begin
  source_row := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  tenant_id := nullif(source_row ->> 'tenant_workspace_id', '')::uuid;
  record_id := nullif(source_row ->> 'id', '')::uuid;
  if tenant_id is not null then
    insert into public.audit_logs(tenant_workspace_id, actor_user_id, action, entity_type, entity_id)
    values (tenant_id, auth.uid(), lower(tg_op), tg_table_name, record_id);
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end $$;

create or replace function private.reject_audit_mutation()
returns trigger language plpgsql
set search_path = pg_catalog
as $$ begin
  raise exception using errcode = '42501', message = 'audit logs are append-only';
end $$;

create or replace function private.guard_alias_domain_lifecycle()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public, auth
as $$
declare key_name text;
begin
  if tg_op = 'DELETE' then key_name := old.setting_key; else key_name := new.setting_key; end if;
  if key_name = 'auth_alias_domain' and exists (select 1 from auth.users limit 1) then
    raise exception using errcode = '42501', message = 'alias domain requires an explicit identity migration';
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end $$;

drop trigger if exists user_profiles_touch on public.user_profiles;
create trigger user_profiles_touch before update on public.user_profiles for each row execute function private.touch_versioned_record();
drop trigger if exists user_profiles_identity_guard on public.user_profiles;
create trigger user_profiles_identity_guard before update on public.user_profiles for each row execute function private.guard_immutable_columns();
drop trigger if exists user_profiles_username_immutable on public.user_profiles;
create trigger user_profiles_username_immutable before update of username on public.user_profiles for each row execute function private.prevent_username_change();
drop trigger if exists user_security_states_touch on public.user_security_states;
create trigger user_security_states_touch before update on public.user_security_states for each row execute function private.touch_versioned_record();
drop trigger if exists tenant_workspaces_touch on public.tenant_workspaces;
create trigger tenant_workspaces_touch before update on public.tenant_workspaces for each row execute function private.touch_versioned_record();
drop trigger if exists tenant_workspaces_created_stamp on public.tenant_workspaces;
create trigger tenant_workspaces_created_stamp before insert on public.tenant_workspaces for each row execute function private.stamp_created_record();
drop trigger if exists tenant_workspaces_identity_guard on public.tenant_workspaces;
create trigger tenant_workspaces_identity_guard before update on public.tenant_workspaces for each row execute function private.guard_immutable_columns();
drop trigger if exists tenant_workspaces_soft_delete_guard on public.tenant_workspaces;
create trigger tenant_workspaces_soft_delete_guard before update of deleted_at on public.tenant_workspaces for each row execute function private.guard_soft_delete_transition('workspace.delete', 'workspace.restore');
drop trigger if exists tenant_memberships_touch on public.tenant_memberships;
create trigger tenant_memberships_touch before update on public.tenant_memberships for each row execute function private.touch_versioned_record();
drop trigger if exists tenant_memberships_created_stamp on public.tenant_memberships;
create trigger tenant_memberships_created_stamp before insert on public.tenant_memberships for each row execute function private.stamp_created_record();
drop trigger if exists tenant_memberships_identity_guard on public.tenant_memberships;
create trigger tenant_memberships_identity_guard before update on public.tenant_memberships for each row execute function private.guard_immutable_columns();
drop trigger if exists tenant_memberships_mutation_guard on public.tenant_memberships;
create trigger tenant_memberships_mutation_guard before insert or update or delete on public.tenant_memberships for each row execute function private.guard_membership_mutation();
drop trigger if exists permission_overrides_mutation_guard on public.user_permission_overrides;
create trigger permission_overrides_mutation_guard before insert or update or delete on public.user_permission_overrides for each row execute function private.guard_permission_override();
drop trigger if exists permission_overrides_identity_guard on public.user_permission_overrides;
create trigger permission_overrides_identity_guard before update on public.user_permission_overrides for each row execute function private.guard_immutable_columns();
drop trigger if exists permission_overrides_created_stamp on public.user_permission_overrides;
create trigger permission_overrides_created_stamp before insert on public.user_permission_overrides for each row execute function private.stamp_created_record();
drop trigger if exists cases_touch on public.cases;
create trigger cases_touch before update on public.cases for each row execute function private.touch_versioned_record();
drop trigger if exists cases_created_stamp on public.cases;
create trigger cases_created_stamp before insert on public.cases for each row execute function private.stamp_created_record();
drop trigger if exists cases_identity_guard on public.cases;
create trigger cases_identity_guard before update on public.cases for each row execute function private.guard_immutable_columns();
drop trigger if exists cases_soft_delete_guard on public.cases;
create trigger cases_soft_delete_guard before update of deleted_at on public.cases for each row execute function private.guard_scoped_soft_delete_transition('cases.delete_assigned', 'cases.delete_any', 'cases.restore', 'assigned_user_id');
drop trigger if exists calendar_events_touch on public.calendar_events;
create trigger calendar_events_touch before update on public.calendar_events for each row execute function private.touch_versioned_record();
drop trigger if exists calendar_events_created_stamp on public.calendar_events;
create trigger calendar_events_created_stamp before insert on public.calendar_events for each row execute function private.stamp_created_record();
drop trigger if exists calendar_events_identity_guard on public.calendar_events;
create trigger calendar_events_identity_guard before update on public.calendar_events for each row execute function private.guard_immutable_columns();
drop trigger if exists calendar_events_soft_delete_guard on public.calendar_events;
create trigger calendar_events_soft_delete_guard before update of deleted_at on public.calendar_events for each row execute function private.guard_scoped_soft_delete_transition('calendar.delete_own', 'calendar.delete_any', 'calendar.restore', 'owner_user_id');
drop trigger if exists notifications_touch on public.notifications;
create trigger notifications_touch before update on public.notifications for each row execute function private.touch_versioned_record();
drop trigger if exists notifications_created_stamp on public.notifications;
create trigger notifications_created_stamp before insert on public.notifications for each row execute function private.stamp_created_record();
drop trigger if exists calendar_participants_created_stamp on public.calendar_event_participants;
create trigger calendar_participants_created_stamp before insert on public.calendar_event_participants for each row execute function private.stamp_created_record();
drop trigger if exists notifications_identity_guard on public.notifications;
create trigger notifications_identity_guard before update on public.notifications for each row execute function private.guard_immutable_columns();
drop trigger if exists system_settings_touch on public.system_settings;
create trigger system_settings_touch before update on public.system_settings for each row execute function private.touch_versioned_record();
drop trigger if exists system_settings_alias_domain_guard on public.system_settings;
create trigger system_settings_alias_domain_guard before insert or update or delete on public.system_settings for each row execute function private.guard_alias_domain_lifecycle();
drop trigger if exists system_settings_identity_guard on public.system_settings;
create trigger system_settings_identity_guard before update on public.system_settings for each row execute function private.guard_immutable_columns();
drop trigger if exists tenant_settings_touch on public.tenant_settings;
create trigger tenant_settings_touch before update on public.tenant_settings for each row execute function private.touch_versioned_record();
drop trigger if exists tenant_settings_identity_guard on public.tenant_settings;
create trigger tenant_settings_identity_guard before update on public.tenant_settings for each row execute function private.guard_immutable_columns();
drop trigger if exists user_preferences_touch on public.user_preferences;
create trigger user_preferences_touch before update on public.user_preferences for each row execute function private.touch_versioned_record();
drop trigger if exists user_preferences_identity_guard on public.user_preferences;
create trigger user_preferences_identity_guard before update on public.user_preferences for each row execute function private.guard_immutable_columns();

drop trigger if exists cases_audit on public.cases;
create trigger cases_audit after insert or update or delete on public.cases for each row execute function private.capture_audit_event();
drop trigger if exists calendar_events_audit on public.calendar_events;
create trigger calendar_events_audit after insert or update or delete on public.calendar_events for each row execute function private.capture_audit_event();
drop trigger if exists notifications_audit on public.notifications;
create trigger notifications_audit after insert or update or delete on public.notifications for each row execute function private.capture_audit_event();
drop trigger if exists tenant_memberships_audit on public.tenant_memberships;
create trigger tenant_memberships_audit after insert or update or delete on public.tenant_memberships for each row execute function private.capture_audit_event();
drop trigger if exists tenant_settings_audit on public.tenant_settings;
create trigger tenant_settings_audit after insert or update or delete on public.tenant_settings for each row execute function private.capture_audit_event();
drop trigger if exists audit_logs_immutable on public.audit_logs;
create trigger audit_logs_immutable before update or delete on public.audit_logs for each row execute function private.reject_audit_mutation();

alter table public.user_profiles enable row level security;
alter table public.user_security_states enable row level security;
alter table public.tenant_workspaces enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_permission_overrides enable row level security;
alter table public.cases enable row level security;
alter table public.calendar_events enable row level security;
alter table public.calendar_event_participants enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.system_settings enable row level security;
alter table public.tenant_settings enable row level security;
alter table public.user_preferences enable row level security;

revoke all on all tables in schema public from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
revoke all on schema private from public, anon;
revoke create on schema public from public, anon, authenticated;
alter default privileges in schema public revoke all on tables from public, anon, authenticated;
alter default privileges in schema private revoke execute on functions from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;
grant execute on function private.current_user_is_enabled() to authenticated, service_role;
grant execute on function private.has_permission(uuid, text) to authenticated, service_role;
grant all on public.user_profiles, public.user_security_states, public.tenant_workspaces,
  public.tenant_memberships, public.permissions, public.role_permissions,
  public.user_permission_overrides, public.cases, public.calendar_events,
  public.calendar_event_participants, public.notifications, public.system_settings,
  public.tenant_settings, public.user_preferences to service_role;
grant select, insert on public.audit_logs to service_role;
grant usage, select on all sequences in schema public to service_role;

grant select, update on public.user_profiles to authenticated;
grant select on public.user_security_states to authenticated;
grant select, update on public.tenant_workspaces to authenticated;
grant select, insert, update, delete on public.tenant_memberships to authenticated;
grant select on public.permissions, public.role_permissions to authenticated;
grant select, insert, update, delete on public.user_permission_overrides to authenticated;
grant select, insert, update on public.cases to authenticated;
grant select, insert, update on public.calendar_events to authenticated;
grant select, insert, delete on public.calendar_event_participants to authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant select on public.audit_logs to authenticated;
grant select, insert, update, delete on public.tenant_settings, public.user_preferences to authenticated;

drop policy if exists tenant_workspaces_select on public.tenant_workspaces;
create policy tenant_workspaces_select on public.tenant_workspaces for select to authenticated using ((deleted_at is null or private.has_permission(id, 'workspace.restore')) and private.has_permission(id, 'workspace.read'));
drop policy if exists tenant_workspaces_update on public.tenant_workspaces;
create policy tenant_workspaces_update on public.tenant_workspaces for update to authenticated using (private.has_permission(id, 'workspace.manage')) with check (private.has_permission(id, 'workspace.manage'));
drop policy if exists tenant_workspaces_delete on public.tenant_workspaces;
create policy tenant_workspaces_delete on public.tenant_workspaces for delete to authenticated using (private.has_permission(id, 'workspace.delete'));

drop policy if exists tenant_memberships_select on public.tenant_memberships;
create policy tenant_memberships_select on public.tenant_memberships for select to authenticated using (private.has_permission(tenant_workspace_id, 'members.read'));
drop policy if exists tenant_memberships_insert on public.tenant_memberships;
create policy tenant_memberships_insert on public.tenant_memberships for insert to authenticated with check (private.has_permission(tenant_workspace_id, 'members.manage'));
drop policy if exists tenant_memberships_update on public.tenant_memberships;
create policy tenant_memberships_update on public.tenant_memberships for update to authenticated using (private.has_permission(tenant_workspace_id, 'members.manage')) with check (private.has_permission(tenant_workspace_id, 'members.manage'));
drop policy if exists tenant_memberships_delete on public.tenant_memberships;
create policy tenant_memberships_delete on public.tenant_memberships for delete to authenticated using (private.has_permission(tenant_workspace_id, 'members.manage'));

drop policy if exists user_profiles_select on public.user_profiles;
create policy user_profiles_select on public.user_profiles for select to authenticated using (
  user_id = auth.uid() or exists (
    select 1 from public.tenant_memberships target
    where target.user_id = user_profiles.user_id
      and target.status = 'active'
      and private.has_permission(target.tenant_workspace_id, 'profiles.read')
  )
);
drop policy if exists user_profiles_update on public.user_profiles;
create policy user_profiles_update on public.user_profiles for update to authenticated using (
  (user_id = auth.uid() and private.current_user_is_enabled()) or exists (
    select 1 from public.tenant_memberships target
    where target.user_id = user_profiles.user_id
      and private.has_permission(target.tenant_workspace_id, 'profiles.manage')
  )
) with check (
  (user_id = auth.uid() and private.current_user_is_enabled()) or exists (
    select 1 from public.tenant_memberships target
    where target.user_id = user_profiles.user_id
      and private.has_permission(target.tenant_workspace_id, 'profiles.manage')
  )
);

drop policy if exists user_security_states_select on public.user_security_states;
create policy user_security_states_select on public.user_security_states for select to authenticated using (
  user_id = auth.uid() or exists (
    select 1 from public.tenant_memberships target
    where target.user_id = user_security_states.user_id
      and private.has_permission(target.tenant_workspace_id, 'members.manage')
  )
);

drop policy if exists permissions_select on public.permissions;
create policy permissions_select on public.permissions for select to authenticated using (private.current_user_is_enabled());
drop policy if exists role_permissions_select on public.role_permissions;
create policy role_permissions_select on public.role_permissions for select to authenticated using (private.current_user_is_enabled());

drop policy if exists permission_overrides_select on public.user_permission_overrides;
create policy permission_overrides_select on public.user_permission_overrides for select to authenticated using (private.has_permission(tenant_workspace_id, 'members.read'));
drop policy if exists permission_overrides_insert on public.user_permission_overrides;
create policy permission_overrides_insert on public.user_permission_overrides for insert to authenticated with check (private.has_permission(tenant_workspace_id, 'members.manage'));
drop policy if exists permission_overrides_update on public.user_permission_overrides;
create policy permission_overrides_update on public.user_permission_overrides for update to authenticated using (private.has_permission(tenant_workspace_id, 'members.manage')) with check (private.has_permission(tenant_workspace_id, 'members.manage'));
drop policy if exists permission_overrides_delete on public.user_permission_overrides;
create policy permission_overrides_delete on public.user_permission_overrides for delete to authenticated using (private.has_permission(tenant_workspace_id, 'members.manage'));

drop policy if exists cases_select on public.cases;
create policy cases_select on public.cases for select to authenticated using ((deleted_at is null or private.has_permission(tenant_workspace_id, 'cases.restore')) and private.has_permission(tenant_workspace_id, 'cases.read'));
drop policy if exists cases_insert on public.cases;
create policy cases_insert on public.cases for insert to authenticated with check (
  private.has_permission(tenant_workspace_id, 'cases.create')
  and (assigned_user_id = auth.uid() or private.has_permission(tenant_workspace_id, 'cases.update_any'))
);
drop policy if exists cases_update on public.cases;
create policy cases_update on public.cases for update to authenticated using (
  (assigned_user_id = auth.uid() and private.has_permission(tenant_workspace_id, 'cases.update_assigned'))
  or private.has_permission(tenant_workspace_id, 'cases.update_any')
) with check (
  (assigned_user_id = auth.uid() and private.has_permission(tenant_workspace_id, 'cases.update_assigned'))
  or private.has_permission(tenant_workspace_id, 'cases.update_any')
);
drop policy if exists cases_delete on public.cases;
create policy cases_delete on public.cases for delete to authenticated using (private.has_permission(tenant_workspace_id, 'cases.delete_any'));

drop policy if exists calendar_events_select on public.calendar_events;
create policy calendar_events_select on public.calendar_events for select to authenticated using ((deleted_at is null or private.has_permission(tenant_workspace_id, 'calendar.restore')) and private.has_permission(tenant_workspace_id, 'calendar.read'));
drop policy if exists calendar_events_insert on public.calendar_events;
create policy calendar_events_insert on public.calendar_events for insert to authenticated with check (
  source = 'manual'
  and private.has_permission(tenant_workspace_id, 'calendar.create')
  and (owner_user_id = auth.uid() or private.has_permission(tenant_workspace_id, 'calendar.update_any'))
);
drop policy if exists calendar_events_update on public.calendar_events;
create policy calendar_events_update on public.calendar_events for update to authenticated using (
  source = 'manual' and (
    (owner_user_id = auth.uid() and private.has_permission(tenant_workspace_id, 'calendar.update_own'))
    or private.has_permission(tenant_workspace_id, 'calendar.update_any')
  )
) with check (
  source = 'manual' and (
    (owner_user_id = auth.uid() and private.has_permission(tenant_workspace_id, 'calendar.update_own'))
    or private.has_permission(tenant_workspace_id, 'calendar.update_any')
  )
);
drop policy if exists calendar_events_delete on public.calendar_events;
create policy calendar_events_delete on public.calendar_events for delete to authenticated using (source = 'manual' and private.has_permission(tenant_workspace_id, 'calendar.delete_any'));

drop policy if exists calendar_participants_select on public.calendar_event_participants;
create policy calendar_participants_select on public.calendar_event_participants for select to authenticated using (private.has_permission(tenant_workspace_id, 'calendar.read'));
drop policy if exists calendar_participants_insert on public.calendar_event_participants;
create policy calendar_participants_insert on public.calendar_event_participants for insert to authenticated with check (exists (
  select 1 from public.calendar_events event
  where event.id = calendar_event_participants.event_id
    and event.tenant_workspace_id = calendar_event_participants.tenant_workspace_id
    and event.source = 'manual'
    and ((event.owner_user_id = auth.uid() and private.has_permission(calendar_event_participants.tenant_workspace_id, 'calendar.update_own')) or private.has_permission(calendar_event_participants.tenant_workspace_id, 'calendar.update_any'))
));
drop policy if exists calendar_participants_delete on public.calendar_event_participants;
create policy calendar_participants_delete on public.calendar_event_participants for delete to authenticated using (exists (
  select 1 from public.calendar_events event
  where event.id = calendar_event_participants.event_id
    and event.tenant_workspace_id = calendar_event_participants.tenant_workspace_id
    and event.source = 'manual'
    and ((event.owner_user_id = auth.uid() and private.has_permission(calendar_event_participants.tenant_workspace_id, 'calendar.update_own')) or private.has_permission(calendar_event_participants.tenant_workspace_id, 'calendar.update_any'))
));

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications for select to authenticated using (deleted_at is null and recipient_user_id = auth.uid() and private.has_permission(tenant_workspace_id, 'notifications.read'));
drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications for update to authenticated using (recipient_user_id = auth.uid() and private.has_permission(tenant_workspace_id, 'notifications.read')) with check (recipient_user_id = auth.uid() and private.has_permission(tenant_workspace_id, 'notifications.read'));

drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs for select to authenticated using (private.has_permission(tenant_workspace_id, 'audit.read'));
drop policy if exists tenant_settings_select on public.tenant_settings;
create policy tenant_settings_select on public.tenant_settings for select to authenticated using (private.has_permission(tenant_workspace_id, 'settings.read'));
drop policy if exists tenant_settings_insert on public.tenant_settings;
create policy tenant_settings_insert on public.tenant_settings for insert to authenticated with check (private.has_permission(tenant_workspace_id, 'settings.manage'));
drop policy if exists tenant_settings_update on public.tenant_settings;
create policy tenant_settings_update on public.tenant_settings for update to authenticated using (private.has_permission(tenant_workspace_id, 'settings.manage')) with check (private.has_permission(tenant_workspace_id, 'settings.manage'));
drop policy if exists tenant_settings_delete on public.tenant_settings;
create policy tenant_settings_delete on public.tenant_settings for delete to authenticated using (private.has_permission(tenant_workspace_id, 'settings.manage'));

drop policy if exists user_preferences_select on public.user_preferences;
create policy user_preferences_select on public.user_preferences for select to authenticated using (user_id = auth.uid() and private.current_user_is_enabled());
drop policy if exists user_preferences_insert on public.user_preferences;
create policy user_preferences_insert on public.user_preferences for insert to authenticated with check (user_id = auth.uid() and private.current_user_is_enabled());
drop policy if exists user_preferences_update on public.user_preferences;
create policy user_preferences_update on public.user_preferences for update to authenticated using (user_id = auth.uid() and private.current_user_is_enabled()) with check (user_id = auth.uid() and private.current_user_is_enabled());
drop policy if exists user_preferences_delete on public.user_preferences;
create policy user_preferences_delete on public.user_preferences for delete to authenticated using (user_id = auth.uid() and private.current_user_is_enabled());

commit;
