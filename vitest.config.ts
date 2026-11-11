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
        // (The suite is heavy and the machines slow: the default 5s timed out tests that pass alone.)
        testTimeout: 40000,
        hookTimeout: 40000,
        // TWO GROUPS (2026-11-11, the owner: "any way to improve or optimise them?"): the pure logic -- the framework's engine and parser, the
        // design library, the documents' and the stylesheets' checks -- needs no DOM and runs in plain Node, without a jsdom set up for each of its
        // files (that set-up was more than half the run); everything that draws or uses the browser's storage runs in jsdom, each file in its own.
        projects: [
            {
                extends: true,
                test: {
                    name: "logic",
                    environment: "node",
                    include: ["src/framework/**/*.test.ts", "src/library/**/*.test.ts", "src/docs/**/*.test.ts", "src/styles/**/*.test.ts"]
                }
            },
            {
                extends: true,
                test: {
                    name: "dom",
                    environment: "jsdom",
                    setupFiles: ["src/test/setupDom.ts"],
                    include: ["src/**/*.test.{ts,tsx}"],
                    exclude: ["src/framework/**/*.test.ts", "src/library/**/*.test.ts", "src/docs/**/*.test.ts", "src/styles/**/*.test.ts"]
                }
            }
        ]
    }
});
