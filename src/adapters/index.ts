// Adapter selection. V1 = mock. The rest of the app imports `dataAdapter`
// only, so switching to Supabase/live later is a one-line change here.

import type { DataAdapter } from "./DataAdapter";
import { MockDataAdapter } from "./MockDataAdapter";

export const dataAdapter: DataAdapter = new MockDataAdapter();

export type { DataAdapter } from "./DataAdapter";
export * from "./types";
