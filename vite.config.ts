import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import hoverOnlyWithMouse from "./tools/scripts/vite/hover-only-with-mouse.mjs";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  // Every :hover selector only where the input can hover (tools/scripts/vite/hover-only-with-mouse.mjs): a tapped control keeps no hover look on a touch screen.
  css: {
    postcss: {
      plugins: [hoverOnlyWithMouse()],
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      // (and .claude: a worktree there has its own index.html and tsconfig, which Vite would watch, and removing it clears the dependency cache of the running server)
      ignored: ["**/src-tauri/**", "**/.claude/**"],
    },
  },
}));
