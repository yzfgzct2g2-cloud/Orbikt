import type { ReactElement } from "react"; import type { CloudBootstrapResult } from "./bootstrapCloud"; import { ConfigurationUnavailable } from "./ConfigurationUnavailable";
export function CloudRoot({ result }: { readonly result: CloudBootstrapResult<ReactElement> }) { return result.kind === "configuration-unavailable" ? <ConfigurationUnavailable /> : result.application; }
