import { parseClientRuntimeConfig, type ClientRuntimeConfig, type RawClientEnvironment } from "../config/clientRuntimeConfig";
export interface CloudBootstrapDependencies<T> { readonly loadConfiguredApplication: (config: ClientRuntimeConfig) => Promise<T> }
export type CloudBootstrapResult<T> = { readonly kind: "configuration-unavailable" } | { readonly kind: "configured"; readonly application: T };
export async function bootstrapCloud<T>(raw: RawClientEnvironment, deps: CloudBootstrapDependencies<T>): Promise<CloudBootstrapResult<T>> { const parsed = parseClientRuntimeConfig(raw); if (!parsed.ok) return { kind: "configuration-unavailable" }; return { kind: "configured", application: await deps.loadConfiguredApplication(parsed.config) }; }
