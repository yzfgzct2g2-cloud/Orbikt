import { preview } from "vite";
import { sharedViteConfig } from "./viteShared.mjs";

const server = await preview({
  ...sharedViteConfig,
  preview: {
    host: "127.0.0.1",
  },
});

server.printUrls();
