# Toolchain and Verification Playbook

Status: **playbook**, updated 2026-10-21. It replaces the Environment & Toolchain Playbook and the Verification & Regression Playbook, which are merged here.

The exact procedure for working on NorthStardustStudio's frontend, and the record of which test failures are expected. Everything here was checked by use. The list of what to look at on screen is `review-checklist.md`; this file is what to run.

## Repo layout for this workflow

One tree, edited in place. There is no separate build tree and no sync step.

- Application source: `src/` (`framework/`, `components/`, `pages/`, `hooks/`, `services/`, `library/`, `styles/`, `data/`, `assets/`, `test/`, `types/`). Where things are: `code-map.md`.
- Build, test and lint configuration lives at the repository root only: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`. Nothing inside `src/` configures the build.
- Scripts: `scripts/` (`tokens/`, `lint/`, `layout-check/`, `library/`, `catalogue/`, `docs/`, `cards/`). Each is run through an `npm run` name (read `package.json`).
- Desktop shell: `src-tauri/` (Tauri 2). The web build in `dist/` is what Tauri packages.

## Verify a change, in order

1. **Typecheck:** `npx tsc --noEmit`. Clean before going on.
2. **Unit tests:** `npx vitest run` (the 40-second timeout is set in `vitest.config.ts`; `npm run verify` runs this and the other checks in order). About 1,480 tests; all must pass. A confirmed, not-yet-fixed bug is written as `it.fails`, never left as a red test (see below). An `it.fails` that starts to pass is itself reported as a failure: root-cause it, it means the tracked behaviour changed.
3. **The checks that read the code against the rules** (all must be clean):
   - `npm run tokens:check`: the generated colour and size stylesheets match `src/styles/tokens/tokens.ts`.
   - `npm run lint:styles`: no literal colour, corner, gap or breakpoint outside the tokens (known ones are in `scripts/lint/styles-baseline.json`; a new one fails).
   - `npm run lint:css`: no unused or shadowed rule.
   - `npm run docs:check`: the generated parts of the rulebook (`docs:values:check`, `docs:assets:check`) match the code and the library contracts. When it fails, run `npm run docs:values` or `npm run docs:assets`, then read the diff.
   - `npm run tables:check` and `npm run library:check`: the structure tables and the library with its logs are consistent. The other generated documents have `:check` forms too (`library:defaults:check`, `library:components:check`, `library:fields-list:check`, `library:compare:check`, `library:tokens:check`, `library:csv:check`, `library:doc:check`).
4. **Build:** `npm run build` (`tsc && vite build`). Must succeed.
5. **Layout check** (for any change to a page, tile, card or style): `npm run check:layout` (it starts `npm run dev` on port 1420 itself when no server answers, and stops it at the end; it restarts an example when a page reloads under it). It opens every Foundation page of the examples at 1920, 1366 and 768 in light and dark and fails on a finding that is not in `scripts/layout-check/baseline.json`. `npm run check:layout:wide` is the long run (three modes, seven windows, both examples); its baseline is not written yet. Rewrite a baseline only by the owner's decision.
6. **Look at it** in a browser as the owner sees it, in the way `review-checklist.md` says; the automatic checks do not replace it. `npm run tauri dev` runs the same frontend in the desktop shell.
7. **Documents:** the log row in `design/04-log.md`, the rule if a rule changed, the examples if the interface changed (`docs/examples`), then `npm run docs:index`.
8. **Commit** only what was changed. Do not push, merge or tag without the owner's yes.

## What the unit tests cover, and what they do not

Vitest is the only unit-test layer: parsing, number and date logic, data transforms, what a component or a hook computes, the generated documents, and the examples (`ExampleDrift`, `ExampleCompleteness`, the golden files). `environment: "jsdom"` is set in `vitest.config.ts` (a separate file from `vite.config.ts`, whose `server` block is for Tauri). A test stands beside what it tests; tests that cross components are in `components/interview/tests/`.

Document tests: `src/docs/documentReferences.test.ts` (six documents name only properties, classes and files the code has), `documentValues.test.ts` and `documentAssets.test.ts` (the generated parts of the rulebook).

A green run proves the logic, not the look. How the app renders and responds to the pointer is checked by the layout check and by looking (steps 5 and 6).

To rewrite the examples after an interface change: `UPDATE_EXAMPLES=1 npx vitest run src/services/ExampleDrift.test.ts` (it writes both examples, in `src/data/examples/`, from the app's own readers); the golden figures are rewritten with `WRITE_GOLDEN=all`.

## The console walk

`npm run check:console` opens every Foundation page of both examples with every tile's dialog and reports what the browser console, the page and the network said (errors, warnings, uncaught exceptions, failed requests); it fails on any. Run it after a change to how a page is built, as the layout check shows how a page looks and this shows whether it throws. It starts the dev server itself when none answers.

## The app files alone

`npm run export:app` copies the app's own files (no tests, documents, tools or catalogue) into `exports/app/` (ignored by git) and builds them there; `-- --clean` also installs in that folder alone. It fails, naming the file, if an app file imports something that was left out. See `docs/design/26-folder-plan.md`.

## Continuous integration

`.github/workflows/ci.yml` runs on every push and every pull request into `main`: typecheck, unit tests, build, and the checks that need no browser (`tokens:check`, `lint:styles`, `lint:controls`, `lint:css`, `docs:check`, `tables:check`, `library:check`). A second job, `layout`, runs the layout check in headless Chromium on pull requests and when started by hand (`workflow_dispatch`). It is a floor: a person still reads a failure. `lint:controls` (`scripts/lint/shared-controls.mjs`, baseline `shared-controls-baseline.json`) fails when a stylesheet other than a shared control's own sets that control's look (ground, line, letters, height, padding); the 46 second looks that exist are the baseline to remove, not to grow. The layout check waits for the fonts and multiplies its waits by `CHECK_SLOW` (default 1.5; 3 on a busy machine).

## Common failure modes

- **The dev server port is fixed:** `vite.config.ts` sets `port: 1420` with `strictPort: true` because Tauri expects it. A stale process holding 1420 makes `npm run dev` fail; stop it, do not change the port.
- **Slow machine, timeouts:** the tests carry a 40-second timeout in `vitest.config.ts`; the layout check takes minutes and must run alone.
- **Filename guesses fail:** a System's file triad is not named alike everywhere (one System's Answer and Help files use a literal `&`, its Questions file spells out "And"). List the directory first.
- **A test looks wrong but the app is right:** check whether the assertion's assumption (an old label, a stale fixture) is what is stale. Decide which side is wrong before fixing either.
- **A test of a document fails after a rename:** `documentReferences.test.ts` lists six documents by path and fails when one names a property, class or file the code does not have; fix the document's reference, not the test.

## How to triage a red result

1. Check the list below first. If the failure is listed and its reason still applies, it is expected.
2. If it is listed but the reason may no longer apply (the file was touched by this change), re-verify.
3. If it is new, root-cause it before shipping: read what the assertion checks and decide whether the app or the assertion is wrong. Add it below only when sure.
4. Update this list in the same session. A stale list invites waving away a real regression.

Where practical, an expected failure is also marked in the test itself (`it.fails`), because a mark in the code drifts less than a line in a document.

## Currently known expected failures

- `src/hooks/useListAutoFormat.test.tsx`, `keeps the cursor at the end of a pasted numbered block whose renumbering adds a digit`: marked `it.fails`. It documents a real bug (`outstanding-findings.md`, the `useListAutoFormat` entry), so do not loosen the assertion. `it.fails` reports the still-broken behaviour as a pass, which keeps `npm test` and CI green. When the fix lands, the assertions pass and `it.fails` turns that into a failure: that is the signal to remove `.fails` and close the entry.

That is the whole list. Everything else is expected to be green.

## Stability

This file changes when the toolchain changes (a script, a port, a build layout) and when a failure is triaged. If a step stops matching reality, fix this file in the same session.
