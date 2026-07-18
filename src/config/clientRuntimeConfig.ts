import { validateAliasDomain } from "../../shared/auth/authIdentity";
export interface RawClientEnvironment { VITE_SUPABASE_URL?: unknown; VITE_SUPABASE_PUBLISHABLE_KEY?: unknown; VITE_AUTH_ALIAS_DOMAIN?: unknown }
export interface ClientRuntimeConfig { readonly supabaseUrl: string; readonly supabasePublishableKey: string; readonly authAliasDomain: string }
export type ClientConfigResult = { readonly ok: true; readonly config: ClientRuntimeConfig } | { readonly ok: false; readonly issues: readonly string[] };
const text = (v: unknown) => typeof v === "string" && v.trim() !== "" && v === v.trim() ? v : undefined;
export function parseClientRuntimeConfig(raw: RawClientEnvironment): ClientConfigResult {
  const url = text(raw.VITE_SUPABASE_URL); const key = text(raw.VITE_SUPABASE_PUBLISHABLE_KEY); const domain = text(raw.VITE_AUTH_ALIAS_DOMAIN);
  let validUrl = false; try { if (url) { const parsed = new URL(url); validUrl = parsed.protocol === "https:" && !parsed.username && !parsed.password && !parsed.search && !parsed.hash && (parsed.pathname === "/" || parsed.pathname === ""); } } catch { validUrl = false; }
  const validKey = !!key && /^sb_publishable_[A-Za-z0-9_-]+$/u.test(key); const validDomain = !!domain && validateAliasDomain(domain).ok;
  if (validUrl && validKey && validDomain) return { ok: true, config: Object.freeze({ supabaseUrl: new URL(url!).origin, supabasePublishableKey: key!, authAliasDomain: domain! }) };
  return { ok: false, issues: [!validUrl ? "supabase-url" : "", !validKey ? "supabase-publishable-key" : "", !validDomain ? "auth-alias-domain" : ""].filter(Boolean) };
}
