// Adapter selection. V1 = CS100 seed (sanitized from mock-data/CS100.xlsx).
// The rest of the app imports `dataAdapter` only, so switching to Supabase/live
// later is a one-line change here.

import type { DataAdapter } from "./DataAdapter";
import { Cs100DataAdapter } from "./Cs100DataAdapter";

export const dataAdapter: DataAdapter = new Cs100DataAdapter();

export type { DataAdapter } from "./DataAdapter";
export * from "./types";
