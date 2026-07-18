export type AliasDomainResult = { readonly ok: true; readonly domain: string } | { readonly ok: false; readonly code: "alias_domain_missing" | "alias_domain_invalid" };
export type AuthIdentityResult = { readonly ok: true; readonly value: { readonly username: string; readonly identifier: string } } | { readonly ok: false; readonly code: "username_invalid" | "alias_domain_missing" | "alias_domain_invalid" };
const USERNAME = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/u;
const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/u;
export function normalizeUsername(raw: string): string { return raw.trim().toLowerCase(); }
export function validateAliasDomain(raw: string | undefined): AliasDomainResult {
  if (raw === undefined || raw.trim() === "") return { ok: false, code: "alias_domain_missing" };
  if (raw !== raw.trim() || raw !== raw.toLowerCase() || raw.length > 253 || /[^a-z0-9.-]/u.test(raw)) return { ok: false, code: "alias_domain_invalid" };
  const labels = raw.split(".");
  return labels.length >= 2 && labels.every((label) => label.length >= 1 && label.length <= 63 && LABEL.test(label)) ? { ok: true, domain: raw } : { ok: false, code: "alias_domain_invalid" };
}
export function createAuthIdentity(rawUsername: string, rawDomain: string | undefined): AuthIdentityResult {
  const username = normalizeUsername(rawUsername);
  if (username.length < 3 || username.length > 32 || !USERNAME.test(username)) return { ok: false, code: "username_invalid" };
  const domain = validateAliasDomain(rawDomain);
  if (!domain.ok) return domain;
  return { ok: true, value: { username, identifier: `${username}@${domain.domain}` } };
}
