# Environment & Toolchain Playbook

Status: **playbook**, updated 2026-08-02.

Read this first, every session. It's the exact procedure — not a description of one — for working on NorthStardustStudio's frontend. Everything here was verified by direct use, not inferred.

## Repo layout for this workflow

One tree, edited in place — there is no separate build tree and no sync step.

- Application source: `src/` (`framework/`, `components/`, `pages/`, `hooks/`, `services/`, `assets/`, `data/`, `styles/`, `types/`).
- Build and test configuration lives at the repository root only: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`. Nothing inside `src/` configures the build — if you find a config file there, it's a stray, not an override.
- Desktop shell: `src-tauri/` (Tauri 2). The web build in `dist/` is what Tauri packages.

## Verify a change, in order

1. **Typecheck:** `npx tsc --noEmit` from the repository root. Must be clean before proceeding.
2. **Unit tests:** `npm test` (`vitest run`). Must exit clean (code 0) before proceeding — a confirmed, not-yet-fixed bug gets encoded as `it.fails`, not left as an ordinary red test, specifically so this stays a hard "must be green" gate rather than one with a standing exception to remember (see the Verification & Regression Playbook's known-failures list and `docs/ai/outstanding-findings.md`). An `it.fails` test that starts passing for real is itself reported as a failure — that's a real regression in this step's sense (the tracked bug's behavior changed) and should be root-caused like any other, even though the underlying change is actually good news.
3. **Build:** `npm run build`. Must succeed before proceeding.
4. **Run the app** — for any change whose effect is visual or interactive, not for every change. `npm run dev` serves the frontend on `http://localhost:1420` (a fixed port with `strictPort`, because Tauri expects it); `npm run tauri dev` runs the same frontend inside the real desktop shell. There is no automated browser-driven suite in this repository, so this step is where interaction-level behavior actually gets confirmed — exercise the specific thing that changed rather than glancing at the page.
5. **Push.** See AI Collaboration Rules for when this should happen automatically.

## What the unit tests cover, and what they don't

Vitest (`npm test`) is this project's only automated test layer. It's aimed at logic that's cheap and fast to pin down with a direct assertion: parsing, string/index math, data transforms, and anything a component, hook, or service computes internally. A combinatorial edge case (e.g. every digit-count boundary a renumbering pass could cross) is one line here and impractical to cover exhaustively any other way.

What it deliberately doesn't cover is how the app renders and responds to sustained real interaction — that's step 4 above, done by hand. There is no browser-driven end-to-end suite in this repository and none is assumed. Don't treat a green `npm test` as proof a feature works; it proves the logic underneath it does.

`src/hooks/useListAutoFormat.test.tsx` is the first instance of this pattern — colocate future unit tests the same way, next to the module they test.

`environment: "jsdom"` is configured globally in `vitest.config.ts` (a separate file from `vite.config.ts` — the latter's `server` block is Tauri-specific and doesn't apply to running tests in Node), so a hook or component test can drive a real DOM element (see the cursor/selection assertions in the example above) without any extra per-file setup.

## Continuous integration

`.github/workflows/ci.yml` runs typecheck, unit tests, and the build on every push and every pull request into `main` — the same three fast, deterministic, headless-safe steps from this playbook's steps 1-3, nothing more. It does not run the app (step 4): that's inherently interactive and belongs to a manual/AI-assisted verification pass (via `regression-verifier`) rather than a check that blocks every single push. CI is a floor, not a replacement for `regression-verifier` — it catches the cheap, unambiguous class of breakage (a type error, a failing unit test, a build that no longer compiles) automatically, on every branch, independent of whether an AI session happens to run the full pipeline that day. It does not classify anything (a real regression vs. an expected failure) the way `regression-verifier` does — a CI failure still needs a person or an AI session to read it and decide what it means; CI only guarantees the question gets asked.

## Common failure modes, already diagnosed once each

- **Dev server port is fixed, not negotiable:** `vite.config.ts` sets `port: 1420` with `strictPort: true` because Tauri expects exactly that port — so a stale process holding 1420 makes `npm run dev` fail outright rather than quietly picking 1421. Stop the old process; don't work around it by changing the port.
- **Filename guesses fail:** this project has inconsistent naming across a System's own file triad (see Framework Conventions & Patterns Reference — one real System's Answer/Help files use a literal `&`, its Questions file spells out "And"). List the directory before assuming a filename pattern holds.
- **A test looks wrong but the app is right:** check whether the assertion's baseline assumption (a hardcoded old label, a fixture that no longer represents real input) is what's actually stale, not the app. Decide which side is wrong before "fixing" either.

## Stability

This file changes only when the toolchain itself changes — a different port, a different script, a different build layout. If a step above stops matching reality, fix this file in the same session, not later.
