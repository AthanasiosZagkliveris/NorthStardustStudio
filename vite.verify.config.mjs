import { mergeConfig } from "vite";
import base from "./vite.config.ts";
export default mergeConfig(typeof base === "function" ? base({ command: "serve", mode: "development" }) : base, { cacheDir: "node_modules/.vite-verify", server: { port: 1425, strictPort: true } });
