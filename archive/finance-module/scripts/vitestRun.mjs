import { startVitest } from "vitest/node";
import { sharedVitestConfig } from "./viteShared.mjs";

const vitest = await startVitest(
  "test",
  process.argv.slice(2),
  { run: true },
  sharedVitestConfig
);

await vitest?.close();
