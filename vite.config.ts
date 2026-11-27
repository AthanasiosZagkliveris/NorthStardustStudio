import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import hoverOnlyWithMouse from "./tools/scripts/vite/hover-only-with-mouse.mjs";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// THE INSTALLABLE WEB APP (docs/proposals/apps-on-every-system.md, G3; Research 9, 3.1): the web manifest Chrome's install needs, and a
// service worker that keeps the built files for use offline and waits for the founder's Reload before a new version takes over
// (registered in main.tsx, announced on the Organisations screen). Off inside the Tauri build, which ships its files itself
// (the Tauri CLI sets TAURI_ENV_PLATFORM), and in `npm run dev`, which keeps hot reload.
// @ts-expect-error process is a nodejs global
const insideTauri = Boolean(process.env.TAURI_ENV_PLATFORM);

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    VitePWA({
      disable: insideTauri,
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["tiles-icon.svg", "tiles-icon-32.png", "tiles-icon-180.png", "theme-init.js"],
      manifest: {
        id: "/",
        name: "Tiles (by North Stardust)",
        short_name: "Tiles",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#0f172a",
        theme_color: "#0f172a",
        icons: [
          { src: "/tiles-icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/tiles-icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/tiles-icon.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2,json}"],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
    }),
  ],

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
