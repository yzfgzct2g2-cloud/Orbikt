import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REQUIRED_SCHEMA_MARKERS = [
  "owner", "admin", "supervisor", "case_manager",
  "permissions", "role_permissions", "user_permission_overrides",
  "tenant_workspaces", "tenant_memberships", "user_profiles",
  "calendar_events", "notifications", "audit_logs", "system_settings",
];
const RLS_TABLES = [
  "user_profiles", "user_security_states", "tenant_workspaces", "tenant_memberships",
  "permissions", "role_permissions", "user_permission_overrides", "cases",
  "calendar_events", "calendar_event_participants", "notifications", "audit_logs",
  "system_settings", "tenant_settings", "user_preferences",
];
const CREDENTIAL_PATTERN = /sb_secret_|supabase_secret_key\s*=|jwt_secret\s*=|database_password\s*=|postgres(?:ql)?:\/\/[^\s:]+:[^\s@]+@/iu;

async function filesUnder(root, relative) {
  const directory = path.join(root, relative);
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).map((entry) => `${relative}/${entry.name}`.replaceAll("\\", "/"));
  } catch { return []; }
}

export async function verifyDatabaseFoundation(repositoryRoot) {
  const findings = [];
  const allMigrationFiles = (await filesUnder(repositoryRoot, "supabase/migrations")).filter((file) => file.endsWith(".sql"));
  const migrationFiles = allMigrationFiles.filter((file) => /^supabase\/migrations\/\d{14}_[a-z0-9_]+\.sql$/u.test(file));
  for (const file of allMigrationFiles.filter((file) => !migrationFiles.includes(file))) findings.push({ category: "migration-filename", file });
  if (migrationFiles.length === 0) findings.push({ category: "migration-missing", file: "supabase/migrations" });
  const paths = [
    ...migrationFiles,
    ...(await filesUnder(repositoryRoot, "supabase/seed")),
    ...(await filesUnder(repositoryRoot, "supabase/tests")),
  ];
  const contents = new Map();
  for (const relative of paths) {
    const content = await readFile(path.join(repositoryRoot, relative), "utf8");
    contents.set(relative, content);
    if (CREDENTIAL_PATTERN.test(content)) findings.push({ category: "credential-material", file: relative });
  }
  const stripComments = (value) => value.replace(/\/\*[\s\S]*?\*\//gu, "").replace(/--.*$/gmu, "");
  const migrationText = stripComments(migrationFiles.map((file) => contents.get(file) ?? "").join("\n")).toLowerCase();
  for (const marker of REQUIRED_SCHEMA_MARKERS) {
    if (!migrationText.includes(marker)) findings.push({ category: "required-schema-marker", file: "supabase/migrations" });
  }
  if (!/create\s+type\s+public\.tenant_role\s+as\s+enum\s*\(\s*'owner'\s*,\s*'admin'\s*,\s*'supervisor'\s*,\s*'case_manager'\s*\)/u.test(migrationText)) findings.push({ category: "role-contract", file: "supabase/migrations" });
  for (const table of RLS_TABLES) {
    if (!new RegExp(`create\\s+table\\s+if\\s+not\\s+exists\\s+public\\.${table}\\b`, "u").test(migrationText)) findings.push({ category: "required-table", file: `public.${table}` });
    if (!new RegExp(`alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security`, "u").test(migrationText)) findings.push({ category: "rls-marker", file: `public.${table}` });
  }
  if (!/create policy/iu.test(migrationText) || /create\s+policy[\s\S]{0,120}\sfor\s+all\b/iu.test(migrationText)) findings.push({ category: "rls-marker", file: "supabase/migrations" });
  if (!/revoke all on all tables in schema public from public, anon, authenticated/iu.test(migrationText) || !/grant select/iu.test(migrationText) || !/to service_role/iu.test(migrationText) || /grant[\s\S]{0,160}\sto anon\b/iu.test(migrationText)) findings.push({ category: "grant-boundary-marker", file: "supabase/migrations" });
  const testText = stripComments([...contents.entries()].filter(([file]) => file.startsWith("supabase/tests/")).map(([, value]) => value).join("\n"));
  if (!/tenant isolation|workspace isolation/iu.test(testText) || !/permission/iu.test(testText) || !/foreign key/iu.test(testText)) findings.push({ category: "sql-test-marker", file: "supabase/tests" });
  return findings;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const findings = await verifyDatabaseFoundation(process.cwd());
  if (findings.length) {
    for (const finding of findings) console.error(`${finding.category}: ${finding.file}`);
    process.exitCode = 1;
  } else {
    console.log("Database foundation repository validation passed.");
  }
}
