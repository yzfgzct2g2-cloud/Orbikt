import react from "@vitejs/plugin-react"; import path from "node:path"; import { fileURLToPath } from "node:url"; import { defineConfig } from "vite";
const repo = fileURLToPath(new URL(".", import.meta.url));
export default defineConfig({ root: path.join(repo, "src", "cloud"), envDir: repo, publicDir: path.join(repo, "public"), base: "./", plugins: [react()], build: { outDir: path.join(repo, "dist-cloud"), emptyOutDir: true, sourcemap: false } });
