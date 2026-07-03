import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

export const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

export const sharedViteConfig = {
  configFile: false,
  root: projectRoot,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "src"),
    },
  },
};

export const sharedVitestConfig = {
  ...sharedViteConfig,
  test: {
    environment: "node",
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "scripts/**/*.test.mjs",
    ],
  },
};
