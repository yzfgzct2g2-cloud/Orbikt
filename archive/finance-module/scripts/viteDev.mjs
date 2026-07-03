import { createServer } from "vite";
import { sharedViteConfig } from "./viteShared.mjs";

const server = await createServer({
  ...sharedViteConfig,
  server: {
    host: "127.0.0.1",
  },
});

await server.listen();
server.printUrls();
