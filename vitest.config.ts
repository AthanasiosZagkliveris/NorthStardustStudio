import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// A separate config file from vite.config.ts, deliberately: vite.config.ts's
// server block is tuned for Tauri (a fixed port, strictPort, a Tauri-only
// HMR host) and none of that applies to running tests in Node -- merging
// the two would mean every test run either ignores that Tauri-only server
// config or risks tripping over it. Vitest picks this file up automatically
// ahead of vite.config.ts when both exist.
//
// environment: "jsdom" -- most of what's worth unit testing here is either
// plain logic (framework/parser, framework/engine, and hook helper
// functions) or a hook/component that needs a real DOM to exercise
// correctly (e.g. cursor/selection state on a textarea, which is exactly
// what useListAutoFormat's tests below need). jsdom covers both without
// needing a per-file environment override.
export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        include: ["src/**/*.test.{ts,tsx}"]
    }
});
