# Orbikt v2 Cloud-Safe Composition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver Workstream 1 of the Orbikt v2 Repository Offline Foundation: an exact environment contract, a shared username-to-alias domain service, a fail-closed Cloud entry, and automated dependency/secret/bundle guards without contacting Supabase Cloud.

**Architecture:** Preserve `index.html -> src/main.tsx -> src/App.tsx` as the explicit local V1 composition. Build Cloud from an independent `src/cloud/index.html -> src/cloud/main.tsx` graph that validates configuration before dynamically loading configured code and is rejected at build time if it reaches local seeds, team data, mock auth, or local persistence. Keep alias rules in one browser/Edge-safe pure TypeScript module and keep build policy in one Node-only JSON contract.

**Tech Stack:** React 18, TypeScript 5.6 project references, Vite 5, Tailwind CSS 3, Vitest 2, Node.js 24 built-ins.

## Global Constraints

- Baseline remains `v1.7.1` / `7dcfae1`; work stays on `feat/orbikt-v2-cloud-foundation`.
- Existing `Workspace` and `/workspace` remain Case Workspace; this workstream creates no tenant selector.
- Client-safe names are exactly `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_AUTH_ALIAS_DOMAIN`.
- Server-only names are exactly `SUPABASE_PROJECT_REF`, `SUPABASE_SECRET_KEY`, and `SUPABASE_DB_PASSWORD`.
- `VITE_AUTH_ALIAS_DOMAIN` is public configuration and may enter the browser bundle; server-only names may not.
- Production code has no alias-domain default. `login.example.test` exists only under test fixtures and must not enter `dist-cloud/`.
- Username normalization is trim then lowercase; normalized usernames are 3-32 ASCII characters matching `^[a-z0-9]+(?:[._-][a-z0-9]+)*$`.
- Alias domains are lowercase ASCII DNS hostnames up to 253 characters with at least two labels; each label is 1-63 characters and matches `^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$`.
- The identifier is exactly `<normalized-username>@<validated-domain>`.
- No password, token, alias, key, network client, Auth request, server function, Cloud user, Cloud link/push/deploy, or data import is introduced in this workstream.
- The existing local build remains available and may contain its current sanitized local data. Only `dist-cloud/` is judged by Cloud bundle rules.
- No runtime or test dependency is added; Supabase SDK, jsdom, Testing Library, and Playwright belong to later workstreams.
- Checkpoint CP-0030 remains version `1.7.1`; no alpha version or release tag is created.

## File Structure

### New production/shared files

- `.env.example` - exact empty client/server environment contract.
- `config/cloud-build-policy.json` - Node-only SSOT for allowed client names, server-only names, forbidden Cloud modules, and sensitive artifact sources.
- `shared/auth/authIdentity.ts` - browser/Edge-safe normalization, validation, and identifier composition.
- `src/config/clientRuntimeConfig.ts` - the only browser module that reads the three client configuration fields.
- `src/vite-env.d.ts` - optional client-safe Vite variables only.
- `src/cloud/bootstrapCloud.ts` - validates before invoking a configured application loader.
- `src/cloud/ConfigurationUnavailable.tsx` - generic noninteractive fail-closed screen.
- `src/cloud/ConfiguredCloudApp.tsx` - honest Workstream 1 configured-state screen with no Auth or adapter imports.
- `src/cloud/CloudRoot.tsx` - renders the two bootstrap outcomes without receiving raw configuration errors.
- `src/cloud/main.tsx` and `src/cloud/index.html` - independent Cloud composition root.
- `build/cloudBuildPolicy.ts` - pure path matcher plus Vite dependency-guard plugin.
- `vite.cloud.config.ts` and `tsconfig.cloud.json` - isolated Cloud build/typecheck configuration.
- `scripts/securityScanCore.mjs` - pure secret/JWT/text-artifact detection.
- `scripts/verifyEnvContract.mjs` - exact env declaration and browser-access guard.
- `scripts/verifyRepositorySecrets.mjs` - tracked-text secret-value scan.
- `scripts/verifyCloudBundle.mjs` - Cloud artifact, source-map, sentinel, and server-env scan.

### New tests/fixtures

- `test/fixtures/authIdentity.ts`
- `shared/auth/authIdentity.test.ts`
- `scripts/verifyEnvContract.test.mjs`
- `src/config/clientRuntimeConfig.test.ts`
- `src/cloud/bootstrapCloud.test.ts`
- `src/cloud/CloudRoot.test.tsx`
- `build/cloudBuildPolicy.test.ts`
- `scripts/securityScanCore.test.mjs`
- `scripts/verifyCloudBundle.test.mjs`

### Modified files

- `.gitignore`, `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `eslint.config.js`, `tailwind.config.js` - wire typechecking, linting, tests, build, and scans.
- `project-state/PROJECT_STATE.json`, `project-state/checkpoints/checkpoint-0030.md`, `project-state/reviews/orbikt-v2-workstream-01-review.md`, `config/project-status.md`, and `CHANGELOG.md` - record Repository evidence and Cloud limits.

---

### Task 1: Lock the environment and auth-identity contracts

**Files:**
- Create: `.env.example`
- Create: `config/cloud-build-policy.json`
- Create: `test/fixtures/authIdentity.ts`
- Create: `shared/auth/authIdentity.ts`
- Test: `shared/auth/authIdentity.test.ts`
- Create: `scripts/verifyEnvContract.mjs`
- Test: `scripts/verifyEnvContract.test.mjs`
- Modify: `.gitignore:1-9`
- Modify: `tsconfig.app.json:28-36`
- Modify: `vite.config.ts:15-23`
- Modify: `eslint.config.js:9-35`

**Interfaces:**
- Produces: `normalizeUsername(raw: string): string`.
- Produces: `validateAliasDomain(raw: string | undefined): AliasDomainResult`.
- Produces: `createAuthIdentity(rawUsername: string, rawDomain: string | undefined): AuthIdentityResult`.
- Produces: `config/cloud-build-policy.json`, consumed only by Node build/verification code.

- [ ] **Step 1: Write the failing identity and env-contract tests**

Create `test/fixtures/authIdentity.ts`:

```ts
export const TEST_ALIAS_DOMAIN = "login.example.test";
export const TEST_SUPABASE_URL = "https://project.test.invalid";
export const TEST_PUBLISHABLE_KEY =
  "sb_publishable_TEST_ONLY_NOT_A_REAL_KEY";
```

Create `shared/auth/authIdentity.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { TEST_ALIAS_DOMAIN } from "../../test/fixtures/authIdentity";
import {
  createAuthIdentity,
  normalizeUsername,
  validateAliasDomain,
} from "./authIdentity";

describe("authIdentity", () => {
  it("trims and lowercases username", () => {
    expect(normalizeUsername("  Case.Manager-01  ")).toBe("case.manager-01");
  });

  it.each(["abc", "case01", "case.manager", "case_manager", "case-manager"])(
    "accepts username %s",
    (username) => {
      expect(createAuthIdentity(username, TEST_ALIAS_DOMAIN).ok).toBe(true);
    }
  );

  it("accepts exact username length boundaries", () => {
    expect(createAuthIdentity("abc", TEST_ALIAS_DOMAIN).ok).toBe(true);
    expect(createAuthIdentity("a".repeat(32), TEST_ALIAS_DOMAIN).ok).toBe(true);
  });

  it.each([
    "ab",
    "a".repeat(33),
    ".case",
    "case.",
    "case..manager",
    "case_-manager",
    "case manager",
    "case@manager",
    "個管01",
  ])("rejects username %s", (username) => {
    expect(createAuthIdentity(username, TEST_ALIAS_DOMAIN).ok).toBe(false);
  });

  it("fails safely when the alias domain is absent", () => {
    expect(createAuthIdentity("case01", undefined)).toEqual({
      ok: false,
      code: "alias_domain_missing",
    });
  });

  it.each([
    "example",
    "HTTPS://login.example.test",
    "https://login.example.test",
    "login.example.test/path",
    "login.example.test:443",
    "user@login.example.test",
    "login.example.test ",
    "Login.example.test",
    "login..example.test",
    "-login.example.test",
    "login-.example.test",
    "login.example.test.",
  ])("rejects alias domain %s", (domain) => {
    expect(validateAliasDomain(domain).ok).toBe(false);
  });

  it("rejects overlong labels and domains", () => {
    expect(validateAliasDomain(`${"a".repeat(64)}.example.test`).ok).toBe(false);
    expect(
      validateAliasDomain(`${"a.".repeat(125)}example.test`).ok
    ).toBe(false);
  });

  it("composes the exact email-shaped identifier", () => {
    expect(createAuthIdentity("  Case.Manager-01  ", TEST_ALIAS_DOMAIN)).toEqual({
      ok: true,
      value: {
        username: "case.manager-01",
        identifier: "case.manager-01@login.example.test",
      },
    });
  });

  it("normalizes intentional aliases to one canonical result", () => {
    expect(createAuthIdentity(" CASE01 ", TEST_ALIAS_DOMAIN)).toEqual(
      createAuthIdentity("case01", TEST_ALIAS_DOMAIN)
    );
  });
});
```

Create `scripts/verifyEnvContract.test.mjs`:

```js
import { describe, expect, it } from "vitest";
import {
  parseEnvExample,
  verifyBrowserEnvironmentAccess,
} from "./verifyEnvContract.mjs";

describe("environment contract verification", () => {
  it("accepts the exact empty contract", () => {
    const text = [
      "VITE_SUPABASE_URL=",
      "VITE_SUPABASE_PUBLISHABLE_KEY=",
      "VITE_AUTH_ALIAS_DOMAIN=",
      "SUPABASE_PROJECT_REF=",
      "SUPABASE_SECRET_KEY=",
      "SUPABASE_DB_PASSWORD=",
    ].join("\n");
    expect(parseEnvExample(text)).toEqual({
      names: [
        "VITE_SUPABASE_URL",
        "VITE_SUPABASE_PUBLISHABLE_KEY",
        "VITE_AUTH_ALIAS_DOMAIN",
        "SUPABASE_PROJECT_REF",
        "SUPABASE_SECRET_KEY",
        "SUPABASE_DB_PASSWORD",
      ],
      nonEmptyNames: [],
    });
  });

  it("rejects server env, process.env, and computed Vite access in browser code", () => {
    expect(verifyBrowserEnvironmentAccess("process.env.SUPABASE_SECRET_KEY"))
      .toContain("process-env");
    expect(verifyBrowserEnvironmentAccess("import.meta.env[name]"))
      .toContain("computed-import-meta-env");
    expect(verifyBrowserEnvironmentAccess("SUPABASE_DB_PASSWORD"))
      .toContain("server-only-env-name");
  });
});
```

- [ ] **Step 2: Run the tests and verify the missing modules fail**

Run:

```text
npx vitest run shared/auth/authIdentity.test.ts scripts/verifyEnvContract.test.mjs
```

Expected: FAIL because `shared/auth/authIdentity.ts` and `scripts/verifyEnvContract.mjs` do not exist.

- [ ] **Step 3: Add the exact empty contracts and pure implementation**

Create `.env.example`:

```dotenv
# Client-safe public configuration
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_AUTH_ALIAS_DOMAIN=

# Server-only configuration and credentials
SUPABASE_PROJECT_REF=
SUPABASE_SECRET_KEY=
SUPABASE_DB_PASSWORD=
```

Create `config/cloud-build-policy.json`:

```json
{
  "clientEnvNames": [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "VITE_AUTH_ALIAS_DOMAIN"
  ],
  "serverOnlyEnvNames": [
    "SUPABASE_PROJECT_REF",
    "SUPABASE_SECRET_KEY",
    "SUPABASE_DB_PASSWORD"
  ],
  "forbiddenCloudModules": [
    "src/main.tsx",
    "src/App.tsx",
    "src/adapters/index.ts",
    "src/adapters/Cs100DataAdapter.ts",
    "src/adapters/LocalCalendarAdapter.ts",
    "src/config/appConfig.ts",
    "src/store/useAppStore.ts",
    "src/store/useCalendarStore.ts",
    "src/data/seed/",
    "config/team.json",
    "supabase/functions/"
  ],
  "forbiddenCloudArtifactMarkers": [
    "Cs100DataAdapter",
    "LocalCalendarAdapter",
    "cases.generated.json",
    "fa310.generated.json",
    "team.json",
    "orbikt.team-calendar.events.v1"
  ],
  "sensitiveArtifactSources": [
    "src/data/seed/cases.generated.json",
    "src/data/seed/fa310.generated.json",
    "config/team.json"
  ]
}
```

Create `shared/auth/authIdentity.ts`:

```ts
const USERNAME_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
const DOMAIN_LABEL_PATTERN =
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export type AuthIdentityErrorCode =
  | "username_too_short"
  | "username_too_long"
  | "username_invalid"
  | "alias_domain_missing"
  | "alias_domain_invalid";

export type AliasDomainResult =
  | { readonly ok: true; readonly domain: string }
  | {
      readonly ok: false;
      readonly code: "alias_domain_missing" | "alias_domain_invalid";
    };

export type AuthIdentityResult =
  | {
      readonly ok: true;
      readonly value: {
        readonly username: string;
        readonly identifier: string;
      };
    }
  | { readonly ok: false; readonly code: AuthIdentityErrorCode };

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateAliasDomain(
  raw: string | undefined
): AliasDomainResult {
  if (raw === undefined || raw === "") {
    return { ok: false, code: "alias_domain_missing" };
  }
  if (raw.length > 253 || raw !== raw.toLowerCase()) {
    return { ok: false, code: "alias_domain_invalid" };
  }
  const labels = raw.split(".");
  if (labels.length < 2 || labels.some((label) => !DOMAIN_LABEL_PATTERN.test(label))) {
    return { ok: false, code: "alias_domain_invalid" };
  }
  return { ok: true, domain: raw };
}

export function createAuthIdentity(
  rawUsername: string,
  rawDomain: string | undefined
): AuthIdentityResult {
  const username = normalizeUsername(rawUsername);
  if (username.length < 3) return { ok: false, code: "username_too_short" };
  if (username.length > 32) return { ok: false, code: "username_too_long" };
  if (!USERNAME_PATTERN.test(username)) {
    return { ok: false, code: "username_invalid" };
  }
  const domain = validateAliasDomain(rawDomain);
  if (!domain.ok) return domain;
  return {
    ok: true,
    value: {
      username,
      identifier: `${username}@${domain.domain}`,
    },
  };
}
```

Create `scripts/verifyEnvContract.mjs` with exported pure helpers and a CLI:

```js
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repositoryRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const policy = JSON.parse(
  readFileSync(
    new URL("../config/cloud-build-policy.json", import.meta.url),
    "utf8"
  )
);

export function parseEnvExample(text) {
  const entries = text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const separator = line.indexOf("=");
      return {
        name: separator >= 0 ? line.slice(0, separator) : line,
        value: separator >= 0 ? line.slice(separator + 1) : "",
      };
    });
  return {
    names: entries.map((entry) => entry.name),
    nonEmptyNames: entries.filter((entry) => entry.value !== "").map((entry) => entry.name),
  };
}

export function verifyBrowserEnvironmentAccess(text) {
  const violations = [];
  if (/\bprocess\.env\b/u.test(text)) violations.push("process-env");
  if (/import\.meta\.env\s*\[/u.test(text)) {
    violations.push("computed-import-meta-env");
  }
  if (policy.serverOnlyEnvNames.some((name) => text.includes(name))) {
    violations.push("server-only-env-name");
  }
  const directNames = [
    ...text.matchAll(/import\.meta\.env\.([A-Z0-9_]+)/gu),
  ].map((match) => match[1]);
  if (directNames.some((name) => !policy.clientEnvNames.includes(name))) {
    violations.push("unapproved-client-env-name");
  }
  return [...new Set(violations)];
}

function run() {
  const envText = readFileSync(path.join(repositoryRoot, ".env.example"), "utf8");
  const parsed = parseEnvExample(envText);
  const expected = [...policy.clientEnvNames, ...policy.serverOnlyEnvNames];
  const violations = [];
  if (JSON.stringify(parsed.names) !== JSON.stringify(expected)) {
    violations.push("env-name-or-order-mismatch");
  }
  if (parsed.nonEmptyNames.length > 0) violations.push("non-empty-env-example");

  const browserFiles = [
    "src",
    "shared",
  ];
  const extensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
  const stack = browserFiles.map((item) => path.join(repositoryRoot, item));
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(target);
      else if (extensions.has(path.extname(entry.name))) {
        for (const violation of verifyBrowserEnvironmentAccess(readFileSync(target, "utf8"))) {
          violations.push(`${path.relative(repositoryRoot, target)}:${violation}`);
        }
      }
    }
  }
  if (violations.length > 0) {
    console.error(violations.join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log("Environment contract verification passed.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run();
}
```

- [ ] **Step 4: Wire shared/test paths and ignore Cloud output**

Make these exact configuration changes:

```text
.gitignore: add dist-cloud/
tsconfig.app.json include: add "shared" and "test"
vite.config.ts test.include: add "shared/**/*.test.ts" and "build/**/*.test.ts"
eslint.config.js ignores: add "dist-cloud"
eslint.config.js browser files: change to ["src/**/*.{ts,tsx}", "shared/**/*.ts", "test/**/*.ts"]
```

- [ ] **Step 5: Run targeted checks until green**

Run:

```text
npx vitest run shared/auth/authIdentity.test.ts scripts/verifyEnvContract.test.mjs
npm run lint
```

Expected: both targeted test files pass and lint exits 0.

- [ ] **Step 6: Commit Task 1**

```text
git add .env.example .gitignore config/cloud-build-policy.json shared test scripts/verifyEnvContract.mjs scripts/verifyEnvContract.test.mjs tsconfig.app.json vite.config.ts eslint.config.js
git commit -m "feat: add cloud environment and auth identity contracts"
```

---

### Task 2: Parse client runtime configuration before construction

**Files:**
- Create: `src/vite-env.d.ts`
- Create: `src/config/clientRuntimeConfig.ts`
- Test: `src/config/clientRuntimeConfig.test.ts`

**Interfaces:**
- Consumes: `validateAliasDomain()` from Task 1.
- Produces: `parseClientRuntimeConfig(raw): ClientRuntimeConfigResult`.
- Produces: immutable `ClientRuntimeConfig` for Task 3 bootstrap.

- [ ] **Step 1: Write the failing parser tests**

Create `src/config/clientRuntimeConfig.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  TEST_ALIAS_DOMAIN,
  TEST_PUBLISHABLE_KEY,
  TEST_SUPABASE_URL,
} from "../../test/fixtures/authIdentity";
import { parseClientRuntimeConfig } from "./clientRuntimeConfig";

const valid = {
  VITE_SUPABASE_URL: TEST_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: TEST_PUBLISHABLE_KEY,
  VITE_AUTH_ALIAS_DOMAIN: TEST_ALIAS_DOMAIN,
};

describe("parseClientRuntimeConfig", () => {
  it("returns an immutable normalized config", () => {
    const result = parseClientRuntimeConfig(valid);
    expect(result).toEqual({
      ok: true,
      config: {
        supabaseUrl: TEST_SUPABASE_URL,
        supabasePublishableKey: TEST_PUBLISHABLE_KEY,
        authAliasDomain: TEST_ALIAS_DOMAIN,
      },
    });
    if (result.ok) expect(Object.isFrozen(result.config)).toBe(true);
  });

  it.each([
    {},
    { VITE_SUPABASE_URL: TEST_SUPABASE_URL },
    { VITE_SUPABASE_PUBLISHABLE_KEY: TEST_PUBLISHABLE_KEY },
    { VITE_AUTH_ALIAS_DOMAIN: TEST_ALIAS_DOMAIN },
    {
      VITE_SUPABASE_URL: TEST_SUPABASE_URL,
      VITE_SUPABASE_PUBLISHABLE_KEY: TEST_PUBLISHABLE_KEY,
    },
    {
      VITE_SUPABASE_URL: TEST_SUPABASE_URL,
      VITE_AUTH_ALIAS_DOMAIN: TEST_ALIAS_DOMAIN,
    },
    {
      VITE_SUPABASE_PUBLISHABLE_KEY: TEST_PUBLISHABLE_KEY,
      VITE_AUTH_ALIAS_DOMAIN: TEST_ALIAS_DOMAIN,
    },
  ])("fails closed for incomplete configuration %#", (raw) => {
    expect(parseClientRuntimeConfig(raw).ok).toBe(false);
  });

  it.each([
    ["VITE_SUPABASE_URL", "http://not-loopback.example.test"],
    ["VITE_SUPABASE_URL", "https://user:pass@project.test.invalid"],
    ["VITE_SUPABASE_URL", "https://project.test.invalid/path"],
    ["VITE_SUPABASE_URL", "https://project.test.invalid?query=1"],
    [
      "VITE_SUPABASE_PUBLISHABLE_KEY",
      ["sb", "secret", "TEST_ONLY_123456789"].join("_"),
    ],
    ["VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_bad key"],
    ["VITE_AUTH_ALIAS_DOMAIN", "https://login.example.test"],
  ])("rejects malformed %s", (name, value) => {
    expect(parseClientRuntimeConfig({ ...valid, [name]: value }).ok).toBe(false);
  });

  it("allows local Supabase only on loopback HTTP", () => {
    const result = parseClientRuntimeConfig({
      ...valid,
      VITE_SUPABASE_URL: "http://127.0.0.1:54321",
    });
    expect(result.ok).toBe(true);
  });

  it("treats whitespace-only values as missing", () => {
    const result = parseClientRuntimeConfig({
      ...valid,
      VITE_AUTH_ALIAS_DOMAIN: "   ",
    });
    expect(result).toMatchObject({ ok: false });
  });

  it("does not echo supplied values in failures", () => {
    const raw = {
      VITE_SUPABASE_URL: "https://user:private@project.test.invalid",
      VITE_SUPABASE_PUBLISHABLE_KEY: [
        "sb",
        "secret",
        "PRIVATE_TEST_SENTINEL",
      ].join("_"),
      VITE_AUTH_ALIAS_DOMAIN: "Private.Example.Test",
    };
    const serialized = JSON.stringify(parseClientRuntimeConfig(raw));
    for (const value of Object.values(raw)) expect(serialized).not.toContain(value);
  });
});
```

- [ ] **Step 2: Run the parser test and verify failure**

Run:

```text
npx vitest run src/config/clientRuntimeConfig.test.ts
```

Expected: FAIL because `clientRuntimeConfig.ts` does not exist.

- [ ] **Step 3: Implement the exact parser and optional Vite types**

Create `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_AUTH_ALIAS_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

Create `src/config/clientRuntimeConfig.ts`:

```ts
import { validateAliasDomain } from "../../shared/auth/authIdentity";

export interface RawClientEnvironment {
  readonly VITE_SUPABASE_URL?: unknown;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: unknown;
  readonly VITE_AUTH_ALIAS_DOMAIN?: unknown;
}

export interface ClientRuntimeConfig {
  readonly supabaseUrl: string;
  readonly supabasePublishableKey: string;
  readonly authAliasDomain: string;
}

export type ClientConfigField =
  | "supabase-url"
  | "supabase-publishable-key"
  | "auth-alias-domain";

export interface ClientConfigIssue {
  readonly field: ClientConfigField;
  readonly kind: "missing" | "malformed";
}

export type ClientRuntimeConfigResult =
  | { readonly ok: true; readonly config: ClientRuntimeConfig }
  | { readonly ok: false; readonly issues: readonly ClientConfigIssue[] };

type ParsedString =
  | { readonly ok: true; readonly value: string }
  | { readonly ok: false; readonly kind: "missing" | "malformed" };

function classifyString(value: unknown): ParsedString {
  if (value === undefined || value === null) {
    return { ok: false, kind: "missing" };
  }
  if (typeof value !== "string") return { ok: false, kind: "malformed" };
  if (value.trim() === "") return { ok: false, kind: "missing" };
  if (value !== value.trim() || /[\u0000-\u001f\u007f]/u.test(value)) {
    return { ok: false, kind: "malformed" };
  }
  return { ok: true, value };
}

function parseSupabaseUrl(value: unknown): ParsedString {
  const classified = classifyString(value);
  if (!classified.ok) return classified;
  try {
    const url = new URL(classified.value);
    const loopback = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const protocolAllowed = url.protocol === "https:" || (url.protocol === "http:" && loopback);
    if (
      !protocolAllowed ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (url.pathname !== "/" && url.pathname !== "")
    ) {
      return { ok: false, kind: "malformed" };
    }
    return { ok: true, value: url.origin };
  } catch {
    return { ok: false, kind: "malformed" };
  }
}

function parsePublishableKey(value: unknown): ParsedString {
  const classified = classifyString(value);
  if (!classified.ok) return classified;
  return /^sb_publishable_[A-Za-z0-9_-]+$/u.test(classified.value)
    ? classified
    : { ok: false, kind: "malformed" };
}

function parseAliasDomain(value: unknown): ParsedString {
  const classified = classifyString(value);
  if (!classified.ok) return classified;
  const result = validateAliasDomain(classified.value);
  return result.ok
    ? { ok: true, value: result.domain }
    : { ok: false, kind: "malformed" };
}

export function parseClientRuntimeConfig(
  raw: RawClientEnvironment
): ClientRuntimeConfigResult {
  const supabaseUrl = parseSupabaseUrl(raw.VITE_SUPABASE_URL);
  const publishableKey = parsePublishableKey(raw.VITE_SUPABASE_PUBLISHABLE_KEY);
  const aliasDomain = parseAliasDomain(raw.VITE_AUTH_ALIAS_DOMAIN);

  if (supabaseUrl.ok && publishableKey.ok && aliasDomain.ok) {
    return {
      ok: true,
      config: Object.freeze({
        supabaseUrl: supabaseUrl.value,
        supabasePublishableKey: publishableKey.value,
        authAliasDomain: aliasDomain.value,
      }),
    };
  }

  const issues: ClientConfigIssue[] = [];
  if (!supabaseUrl.ok) {
    issues.push({ field: "supabase-url", kind: supabaseUrl.kind });
  }
  if (!publishableKey.ok) {
    issues.push({ field: "supabase-publishable-key", kind: publishableKey.kind });
  }
  if (!aliasDomain.ok) {
    issues.push({ field: "auth-alias-domain", kind: aliasDomain.kind });
  }
  return { ok: false, issues: Object.freeze(issues) };
}
```

- [ ] **Step 4: Run the parser and Task 1 regressions**

Run:

```text
npx vitest run src/config/clientRuntimeConfig.test.ts shared/auth/authIdentity.test.ts
npm run lint
```

Expected: all targeted tests pass; lint exits 0.

- [ ] **Step 5: Commit Task 2**

```text
git add src/vite-env.d.ts src/config/clientRuntimeConfig.ts src/config/clientRuntimeConfig.test.ts
git commit -m "feat: validate cloud client configuration"
```

---

### Task 3: Add a separate fail-closed Cloud composition and dependency guard

**Files:**
- Create: `src/cloud/bootstrapCloud.ts`
- Test: `src/cloud/bootstrapCloud.test.ts`
- Create: `src/cloud/ConfigurationUnavailable.tsx`
- Create: `src/cloud/ConfiguredCloudApp.tsx`
- Create: `src/cloud/CloudRoot.tsx`
- Test: `src/cloud/CloudRoot.test.tsx`
- Create: `src/cloud/main.tsx`
- Create: `src/cloud/index.html`
- Create: `build/cloudBuildPolicy.ts`
- Test: `build/cloudBuildPolicy.test.ts`
- Create: `vite.cloud.config.ts`
- Create: `tsconfig.cloud.json`
- Modify: `package.json:6-18`
- Modify: `tsconfig.json:2-6`
- Modify: `tsconfig.app.json:28-36`
- Modify: `tsconfig.node.json:1-24`
- Modify: `eslint.config.js:7-35`
- Modify: `tailwind.config.js:3`

**Interfaces:**
- Consumes: `parseClientRuntimeConfig()` from Task 2.
- Produces: `bootstrapCloud<T>(rawEnv, dependencies): Promise<CloudBootstrapResult<T>>`.
- Produces: a separate `dist-cloud/` artifact while preserving the existing local `dist/` build.
- Enforces: every module parsed by the Cloud Rollup graph is checked against `forbiddenCloudModules`.

- [ ] **Step 1: Write failing bootstrap, rendering, and module-boundary tests**

Create `src/cloud/bootstrapCloud.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import {
  TEST_ALIAS_DOMAIN,
  TEST_PUBLISHABLE_KEY,
  TEST_SUPABASE_URL,
} from "../../test/fixtures/authIdentity";
import { bootstrapCloud } from "./bootstrapCloud";

const validEnvironment = {
  VITE_SUPABASE_URL: TEST_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: TEST_PUBLISHABLE_KEY,
  VITE_AUTH_ALIAS_DOMAIN: TEST_ALIAS_DOMAIN,
};

describe("bootstrapCloud", () => {
  it.each([
    {},
    { VITE_SUPABASE_URL: TEST_SUPABASE_URL },
    { ...validEnvironment, VITE_AUTH_ALIAS_DOMAIN: undefined },
    { ...validEnvironment, VITE_SUPABASE_URL: "http://cloud.example.invalid" },
  ])("never constructs configured code for unsafe environment %#", async (raw) => {
    const loadConfiguredApplication = vi.fn(async () => "configured");
    await expect(
      bootstrapCloud(raw, { loadConfiguredApplication })
    ).resolves.toEqual({ kind: "configuration-unavailable" });
    expect(loadConfiguredApplication).not.toHaveBeenCalled();
  });

  it("passes only immutable validated configuration to the loader", async () => {
    const application = Symbol("configured-application");
    const loadConfiguredApplication = vi.fn(async (config) => {
      expect(Object.isFrozen(config)).toBe(true);
      expect(config).toEqual({
        supabaseUrl: TEST_SUPABASE_URL,
        supabasePublishableKey: TEST_PUBLISHABLE_KEY,
        authAliasDomain: TEST_ALIAS_DOMAIN,
      });
      return application;
    });

    await expect(
      bootstrapCloud(validEnvironment, { loadConfiguredApplication })
    ).resolves.toEqual({ kind: "configured", application });
    expect(loadConfiguredApplication).toHaveBeenCalledOnce();
  });

  it("does not perform a network request while bootstrapping", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    try {
      await bootstrapCloud(validEnvironment, {
        loadConfiguredApplication: async () => "configured",
      });
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
```

Create `src/cloud/CloudRoot.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CloudRoot } from "./CloudRoot";
import { ConfiguredCloudApp } from "./ConfiguredCloudApp";

describe("CloudRoot", () => {
  it("renders a generic, noninteractive configuration failure", () => {
    const html = renderToStaticMarkup(
      <CloudRoot result={{ kind: "configuration-unavailable" }} />
    );
    expect(html).toContain("Orbikt 暫時無法登入");
    expect(html).toContain("請聯絡系統管理員");
    expect(html).not.toMatch(/<input|<form|<a /u);
    expect(html).not.toContain("VITE_");
    expect(html).not.toContain("@");
  });

  it("labels configured Workstream 1 honestly without exposing configuration", () => {
    const html = renderToStaticMarkup(
      <CloudRoot
        result={{
          kind: "configured",
          application: <ConfiguredCloudApp />,
        }}
      />
    );
    expect(html).toContain("登入功能尚未接入");
    expect(html).not.toContain("supabase.co");
    expect(html).not.toContain("sb_publishable_");
    expect(html).not.toContain("@");
  });
});
```

Create `build/cloudBuildPolicy.test.ts`:

```ts
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  findForbiddenCloudModules,
  toRepositoryPath,
} from "./cloudBuildPolicy";

const repositoryRoot = path.resolve("C:/orbikt-policy-test");

describe("cloud build policy", () => {
  it("normalizes Windows module ids without leaking absolute paths", () => {
    const id = path.join(repositoryRoot, "src", "cloud", "main.tsx");
    expect(toRepositoryPath(id, repositoryRoot)).toBe("src/cloud/main.tsx");
  });

  it.each([
    ["src/adapters/index.ts", "src/adapters/index.ts"],
    ["src/data/seed/cases.generated.json", "src/data/seed/"],
    ["config/team.json", "config/team.json"],
    ["supabase/functions/admin-create-user/index.ts", "supabase/functions/"],
  ])("rejects %s through rule %s", (relativeId, rule) => {
    const id = path.join(repositoryRoot, ...relativeId.split("/"));
    expect(findForbiddenCloudModules([id], repositoryRoot)).toEqual([
      { modulePath: relativeId, rule },
    ]);
  });

  it("allows the independent Cloud root and shared auth service", () => {
    const ids = [
      path.join(repositoryRoot, "src", "cloud", "main.tsx"),
      path.join(repositoryRoot, "shared", "auth", "authIdentity.ts"),
    ];
    expect(findForbiddenCloudModules(ids, repositoryRoot)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the three tests and verify the missing modules fail**

Run:

```text
npx vitest run src/cloud/bootstrapCloud.test.ts src/cloud/CloudRoot.test.tsx build/cloudBuildPolicy.test.ts
```

Expected: FAIL because the bootstrap, Cloud components, and build-policy module do not exist.

- [ ] **Step 3: Implement pure bootstrap and the two honest UI states**

Create `src/cloud/bootstrapCloud.ts`:

```ts
import {
  parseClientRuntimeConfig,
  type ClientRuntimeConfig,
  type RawClientEnvironment,
} from "../config/clientRuntimeConfig";

export interface CloudBootstrapDependencies<T> {
  readonly loadConfiguredApplication: (
    config: ClientRuntimeConfig
  ) => Promise<T>;
}

export type CloudBootstrapResult<T> =
  | { readonly kind: "configuration-unavailable" }
  | { readonly kind: "configured"; readonly application: T };

export async function bootstrapCloud<T>(
  rawEnvironment: RawClientEnvironment,
  dependencies: CloudBootstrapDependencies<T>
): Promise<CloudBootstrapResult<T>> {
  const parsed = parseClientRuntimeConfig(rawEnvironment);
  if (!parsed.ok) return { kind: "configuration-unavailable" };
  const application = await dependencies.loadConfiguredApplication(parsed.config);
  return { kind: "configured", application };
}
```

Create `src/cloud/ConfigurationUnavailable.tsx`:

```tsx
export function ConfigurationUnavailable() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section
        role="alert"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-slate-900">
          Orbikt 暫時無法登入
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          系統尚未完成雲端登入設定，請聯絡系統管理員。
        </p>
      </section>
    </main>
  );
}
```

Create `src/cloud/ConfiguredCloudApp.tsx`:

```tsx
export function ConfiguredCloudApp() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Orbikt 雲端基礎
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          雲端登入基礎設定已就緒；登入功能尚未接入。
        </p>
      </section>
    </main>
  );
}
```

Create `src/cloud/CloudRoot.tsx`:

```tsx
import type { ReactElement } from "react";
import type { CloudBootstrapResult } from "./bootstrapCloud";
import { ConfigurationUnavailable } from "./ConfigurationUnavailable";

interface CloudRootProps {
  readonly result: CloudBootstrapResult<ReactElement>;
}

export function CloudRoot({ result }: CloudRootProps) {
  if (result.kind === "configuration-unavailable") {
    return <ConfigurationUnavailable />;
  }
  return result.application;
}
```

- [ ] **Step 4: Implement the machine-enforced module boundary**

Create `build/cloudBuildPolicy.ts`:

```ts
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

interface CloudBuildPolicy {
  readonly forbiddenCloudModules: readonly string[];
}

const policy = JSON.parse(
  readFileSync(
    new URL("../config/cloud-build-policy.json", import.meta.url),
    "utf8"
  )
) as CloudBuildPolicy;

export function toRepositoryPath(
  moduleId: string,
  repositoryRoot: string
): string {
  const withoutQuery = moduleId.replace(/^\u0000/u, "").split("?", 1)[0];
  const candidate = path.isAbsolute(withoutQuery)
    ? path.relative(repositoryRoot, withoutQuery)
    : withoutQuery;
  return candidate.replaceAll("\\", "/");
}

function matchesRule(modulePath: string, rule: string): boolean {
  const normalizedRule = rule.replaceAll("\\", "/");
  return normalizedRule.endsWith("/")
    ? modulePath.startsWith(normalizedRule)
    : modulePath === normalizedRule;
}

export function findForbiddenCloudModules(
  moduleIds: readonly string[],
  repositoryRoot: string
): ReadonlyArray<{ readonly modulePath: string; readonly rule: string }> {
  const violations: Array<{ modulePath: string; rule: string }> = [];
  for (const moduleId of moduleIds) {
    const modulePath = toRepositoryPath(moduleId, repositoryRoot);
    const rule = policy.forbiddenCloudModules.find((item) =>
      matchesRule(modulePath, item)
    );
    if (rule) violations.push({ modulePath, rule });
  }
  return violations;
}

export function cloudBuildBoundaryPlugin(repositoryRoot: string): Plugin {
  return {
    name: "orbikt-cloud-build-boundary",
    enforce: "pre",
    moduleParsed(moduleInfo) {
      const [violation] = findForbiddenCloudModules(
        [moduleInfo.id],
        repositoryRoot
      );
      if (violation) {
        this.error(
          `cloud-boundary:${violation.modulePath}:${violation.rule}`
        );
      }
    },
  };
}
```

The plugin checks the complete parsed Rollup graph, so a forbidden transitive import fails even if tree-shaking would later remove it.

- [ ] **Step 5: Add the independent Cloud entry and build configuration**

Create `src/cloud/main.tsx`:

```tsx
import { StrictMode, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import {
  bootstrapCloud,
  type CloudBootstrapResult,
} from "./bootstrapCloud";
import { CloudRoot } from "./CloudRoot";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Orbikt Cloud root element is missing.");
const root = createRoot(rootElement);

function render(result: CloudBootstrapResult<ReactElement>) {
  root.render(
    <StrictMode>
      <CloudRoot result={result} />
    </StrictMode>
  );
}

void bootstrapCloud<ReactElement>(
  {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY:
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_AUTH_ALIAS_DOMAIN: import.meta.env.VITE_AUTH_ALIAS_DOMAIN,
  },
  {
    loadConfiguredApplication: async () => {
      const { ConfiguredCloudApp } = await import("./ConfiguredCloudApp");
      return <ConfiguredCloudApp />;
    },
  }
)
  .then(render)
  .catch(() => render({ kind: "configuration-unavailable" }));
```

Create `src/cloud/index.html`:

```html
<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Orbikt 雲端工作空間" />
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <title>Orbikt</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
```

Create `vite.cloud.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vite";
import { cloudBuildBoundaryPlugin } from "./build/cloudBuildPolicy";

const repositoryRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: path.join(repositoryRoot, "src", "cloud"),
  envDir: repositoryRoot,
  publicDir: path.join(repositoryRoot, "public"),
  base: "./",
  plugins: [react(), cloudBuildBoundaryPlugin(repositoryRoot)],
  resolve: {
    alias: {
      "@": path.join(repositoryRoot, "src"),
    },
  },
  build: {
    outDir: path.join(repositoryRoot, "dist-cloud"),
    emptyOutDir: true,
    sourcemap: false,
  },
});
```

Create `tsconfig.cloud.json`:

```json
{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.cloud.tsbuildinfo"
  },
  "include": [
    "src/cloud",
    "src/config/clientRuntimeConfig.ts",
    "src/vite-env.d.ts",
    "shared/auth/authIdentity.ts",
    "test/fixtures/authIdentity.ts"
  ]
}
```

Make these exact configuration changes:

```text
package.json:
  typecheck -> "tsc -b"
  add "typecheck:cloud": "tsc -p tsconfig.cloud.json --noEmit"
  add "build:cloud": "npm run typecheck:cloud && vite build --config vite.cloud.config.ts"
tsconfig.json references: append { "path": "./tsconfig.cloud.json" }
tsconfig.app.json: add "exclude": ["src/cloud"]
tsconfig.node.json include: ["vite.config.ts", "vite.cloud.config.ts", "build"]
eslint.config.js ignores: add "dist-cloud"
eslint.config.js: add a Node TypeScript block for ["build/**/*.ts", "vite*.config.ts"] with globals.node
tailwind.config.js content: add "./src/cloud/index.html"
```

- [ ] **Step 6: Run targeted tests, both typechecks, and both builds**

Run each command separately:

```text
npx vitest run src/cloud/bootstrapCloud.test.ts src/cloud/CloudRoot.test.tsx build/cloudBuildPolicy.test.ts
npm run typecheck
npm run typecheck:cloud
npm run lint
npm run build
npm run build:cloud
```

Expected:

- Targeted tests pass.
- The strengthened `tsc -b` typecheck passes.
- Existing local `dist/` build still passes.
- Missing runtime Cloud configuration does not fail the build; `dist-cloud/` is produced with source maps disabled.
- The Cloud graph contains no forbidden local entry, store, adapter, seed, team, or Edge Function module.

- [ ] **Step 7: Commit Task 3**

```text
git add src/cloud build vite.cloud.config.ts tsconfig.cloud.json package.json tsconfig.json tsconfig.app.json tsconfig.node.json eslint.config.js tailwind.config.js
git commit -m "feat: add fail-closed cloud composition"
```
