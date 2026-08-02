# Environment & Toolchain Playbook

Read this first, every session. It's the exact procedure — not a description of one — for working on NorthStardustStudio's frontend. Everything here was verified by direct use, not inferred.

## Repo layout for this workflow

- Canonical source: wherever the project's `src/` tree actually lives (e.g. `framework/`, `components/`, `services/`, `assets/`, `data/`, `styles/`, `types/`).
- If working in a sandboxed copy separate from a live build tree, sync canonical source into the build tree before typechecking/building — don't edit the build-tree copy directly, it gets overwritten by the next sync.

## Verify a change, in order

1. **Sync** source into the build tree (if working in separate copies).
2. **Typecheck:** `npx tsc --noEmit` from the build tree root. Must be clean before proceeding.
3. **Unit tests:** `npm test` (`vitest run`). Must exit clean (code 0) before proceeding — a confirmed, not-yet-fixed bug gets encoded as `it.fails`, not left as an ordinary red test, specifically so this stays a hard "must be green" gate rather than one with a standing exception to remember (see the Verification & Regression Playbook's known-failures list and `docs/ai/outstanding-findings.md`). An `it.fails` test that starts passing for real is itself reported as a failure — that's a real regression in this step's sense (the tracked bug's behavior changed) and should be root-caused like any other, even though the underlying change is actually good news.
4. **Build:** `npm run build`. Must succeed before proceeding.
5. **Preview server:** kill anything already on the port, then start fresh:
   `fuser -k 4190/tcp 2>/dev/null; sleep 1; npx vite preview --port 4190 > preview.log 2>&1 & disown`
   Confirm with `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4190` — expect `200`.
6. **Targeted verification:** write or reuse a Playwright script asserting the specific behavior that changed. Launch Chromium with `executablePath: '/opt/pw-browsers/chromium'` — do not run `playwright install`, the browser is already provisioned there.
7. **Full regression suite:** run every existing `verify_*.mjs` script that points at the preview port. See the Verification & Regression Playbook for how to interpret failures — do not assume a red suite means a regression, and do not assume a green suite means nothing needs checking (some of these scripts predate recent changes and can pass for the wrong reason).
8. **Push.** See AI Collaboration Rules for when this should happen automatically.

## Unit tests vs. the Playwright regression suite — what each is for

Both are real, neither replaces the other. The `verify_*.mjs` Playwright suite exercises the whole running app end to end — real rendering, real user interaction sequences, real cross-component behavior — and is what actually proves a feature works. Vitest (`npm test`) exists for the layer underneath that: pure logic (parsing, string/index math, data transforms) that's cheap and fast to pin down with a direct assertion, and expensive or impractical to cover exhaustively through the browser alone — a combinatorial edge case (e.g. every digit-count boundary a renumbering pass could cross) is one line in a unit test and a whole new Playwright script, run in a whole new browser, to cover the same way. Write a unit test for logic a component/hook/service computes internally; write or extend a Playwright script for anything about how it actually renders or responds to real interaction. `src/hooks/useListAutoFormat.test.tsx` is the first instance of this pattern — colocate future unit tests the same way, next to the module they test.

`environment: "jsdom"` is configured globally in `vitest.config.ts` (a separate file from `vite.config.ts` — the latter's `server` block is Tauri-specific and doesn't apply to running tests in Node), so a hook or component test can drive a real DOM element (see the cursor/selection assertions in the example above) without any extra per-file setup.

## Continuous integration

`.github/workflows/ci.yml` runs typecheck, unit tests, and the build on every push and every pull request into `main` — the same three fast, deterministic, headless-safe steps from this playbook's steps 2-4, nothing more. It deliberately does NOT run the Playwright regression suite: that needs a live preview server and a provisioned browser, is comparatively slow, and belongs to a manual/AI-assisted verification pass (via `regression-verifier`) rather than a check that blocks every single push. CI is a floor, not a replacement for `regression-verifier` — it catches the cheap, unambiguous class of breakage (a type error, a failing unit test, a build that no longer compiles) automatically, on every branch, independent of whether an AI session happens to run the full pipeline that day. It does not classify anything (a real regression vs. an expected failure) the way `regression-verifier` does — a CI failure still needs a person or an AI session to read it and decide what it means; CI only guarantees the question gets asked.

## Common failure modes, already diagnosed once each

- **Preview server "already running" / stale content:** always kill the port before restarting, even if a server "should" already be down — the flag `disown` means it survives a lot.
- **Filename guesses fail:** this project has inconsistent naming across a System's own file triad (see Framework Conventions & Patterns Reference — one real System's Answer/Help files use a literal `&`, its Questions file spells out "And"). List the directory before assuming a filename pattern holds.
- **A Playwright assertion looks wrong but the app is right:** check whether the assertion's baseline assumption (a fixed viewport width, a hardcoded old label) is what's actually stale, not the app. This has happened more than once — a width-centering assertion failed by exactly the width of a scrollbar it didn't account for, not because centering broke.

## Stability

This file changes only when the toolchain itself changes — a different port, a different script location, a different sync procedure. If a step above stops matching reality, fix this file in the same session, not later.
