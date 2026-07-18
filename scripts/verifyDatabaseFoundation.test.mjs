import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { verifyDatabaseFoundation } from "./verifyDatabaseFoundation.mjs";

async function fixture(files) {
  const root = await mkdtemp(path.join(tmpdir(), "orbikt-db-foundation-"));
  for (const [relative, content] of Object.entries(files)) {
    const target = path.join(root, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, "utf8");
  }
  return root;
}

describe("database foundation validator", () => {
  it("rejects a repository without a versioned migration", async () => {
    const root = await fixture({});
    await expect(verifyDatabaseFoundation(root)).resolves.toContainEqual({
      category: "migration-missing",
      file: "supabase/migrations",
    });
  });

  it("rejects forbidden credential material without returning its value", async () => {
    const secret = "sb_secret_TEST_SHOULD_NEVER_BE_PRINTED";
    const root = await fixture({
      "supabase/migrations/20260718000100_test.sql": `select '${secret}';`,
    });
    const findings = await verifyDatabaseFoundation(root);
    expect(findings).toContainEqual({
      category: "credential-material",
      file: "supabase/migrations/20260718000100_test.sql",
    });
    expect(JSON.stringify(findings)).not.toContain(secret);
  });

  it("allows the PostgreSQL service_role identifier without treating it as a credential", async () => {
    const root = await fixture({
      "supabase/migrations/20260718000100_test.sql": "revoke all on table public.example from service_role;",
    });
    expect(await verifyDatabaseFoundation(root)).not.toContainEqual({
      category: "credential-material",
      file: "supabase/migrations/20260718000100_test.sql",
    });
  });

  it("requires role, permission, RLS, revoke, and tenant-isolation contracts", async () => {
    const root = await fixture({
      "supabase/migrations/20260718000100_test.sql": "create table if not exists public.tenant_workspaces(id uuid primary key);",
      "supabase/seed/synthetic_seed.sql": "-- synthetic example.test seed",
      "supabase/tests/database_security_foundation.sql": "begin; rollback;",
    });
    const categories = (await verifyDatabaseFoundation(root)).map((item) => item.category);
    expect(categories).toEqual(expect.arrayContaining([
      "required-schema-marker",
      "rls-marker",
      "grant-boundary-marker",
      "sql-test-marker",
    ]));
  });

  it("does not accept required markers that appear only in SQL comments", async () => {
    const root = await fixture({
      "supabase/migrations/20260718000100_test.sql": "-- tenant_memberships enable row level security create policy revoke all grant select",
      "supabase/seed/synthetic_seed.sql": "-- synthetic example.test seed",
      "supabase/tests/database_security_foundation.sql": "-- tenant isolation permission foreign key",
    });
    expect((await verifyDatabaseFoundation(root)).map((item) => item.category)).toContain("required-schema-marker");
  });

  it("rejects unversioned SQL files in the migration directory", async () => {
    const root = await fixture({
      "supabase/migrations/manual.sql": "select 1;",
    });
    expect(await verifyDatabaseFoundation(root)).toContainEqual({
      category: "migration-filename",
      file: "supabase/migrations/manual.sql",
    });
  });
});
