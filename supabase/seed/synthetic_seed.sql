-- Synthetic development seed only. No Auth users, credentials, real people, or real cases.
begin;

insert into public.tenant_workspaces(id, slug, name)
values ('eeeeeeee-0000-4000-8000-000000000001', 'orbikt-example-test', 'Orbikt Example Test Workspace')
on conflict (id) do nothing;

insert into public.tenant_settings(tenant_workspace_id, setting_key, setting_value)
values (
  'eeeeeeee-0000-4000-8000-000000000001',
  'calendar_timezone',
  '"Asia/Taipei"'::jsonb
)
on conflict (tenant_workspace_id, setting_key) do update
set setting_value = excluded.setting_value;

-- system_settings.auth_alias_domain intentionally remains unset until an
-- organization-controlled domain is approved. Tests use login.example.test only.

commit;
