# Toolchain and verification playbook

Status: **playbook**, written 2026-10-21, updated 2026-11-10. The procedure for working on the frontend, and the record of which test failures are expected.

The exact procedure for working on NorthStardustStudio's frontend, and the record of which test failures are expected. Everything here was checked by use. The list of what to look at on screen is `review-checklist.md`; this file is what to run.

## Repo layout for this workflow

One tree, edited in place. There is no separate build tree and no sync step.

- Application source: `src/` (`framework/`, `components/`, `pages/`, `hooks/`, `services/`, `library/`, `styles/`, `data/`, `assets/`, `test/`, `docs/`, `types/`). Where things are: `code-map.md`.
- Build, test and lint configuration lives at the repository root only: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`. Nothing inside `src/` configures the build.
- Scripts: `tools/scripts/` (`tokens/`, `lint/`, `layout-check/`, `library/`, `catalogue/`, `docs/`, `cards/`, `export/`); the catalogue's own measures, probes, scans and exports are in `tools/catalogue/`. Each script is run through an `npm run` name (read `package.json`).
- Desktop shell: `src-tauri/` (Tauri 2). The web build in `dist/` is what Tauri packages.
- Working files: pictures made for a report go to `exports/` (ignored); the main folder holds no pictures (`/*.png` is ignored), and the assistants' working folders (`.scratch/`, `.superpowers/`, `claude-project/`) are ignored too.

## Verify a change, in order

1. **Typecheck:** `npx tsc --noEmit`. Clean before going on.
2. **Unit tests:** `npx vitest run` (the 40-second timeout is set in `vitest.config.ts`; `npm run verify` runs this and the other checks in order). About 1,500 tests; all must pass. A confirmed, not-yet-fixed bug is written as `it.fails`, never left as a red test (see below). An `it.fails` that starts to pass is itself reported as a failure: root-cause it, it means the tracked behaviour changed.
3. **The checks that read the code against the rules** (all must be clean):
   - `npm run tokens:check`: the generated colour and size stylesheets match `src/styles/tokens/tokens.ts`.
   - `npm run lint:styles`: no literal colour, corner, gap or breakpoint outside the tokens (known ones are in `tools/scripts/lint/styles-baseline.json`; a new one fails).
   - `npm run lint:css`: no unused or shadowed rule.
   - `npm run docs:check`: the generated parts of the rulebook (`docs:values:check`; `docs:assets:check`, whose block is `docs/ai/layout-assets.md`) match the code and the library contracts. When it fails, run `npm run docs:values` or `npm run docs:assets`, then read the diff.
   - `npm run tables:check` and `npm run library:check`: the structure tables and the library with its logs are consistent. The other generated documents have `:check` forms too (`library:defaults:check`, `library:components:check`, `library:fields-list:check`, `library:compare:check`, `library:tokens:check`, `library:csv:check`, `library:doc:check`).
4. **Build:** `npm run build` (`tsc && vite build`). Must succeed.
5. **Layout check** (for any change to a page, tile, card or style): `npm run check:layout` (it starts `npm run dev` on port 1420 itself when no server answers, and stops it at the end; it restarts an example when a page reloads under it; Playwright is a dev dependency). That is the quick run: every Foundation page of the Quillfield example at 1920 wide in the light page, failing on any finding that is not in `tools/scripts/layout-check/baseline.json` (empty today, so any finding fails). `node tools/scripts/layout-check/run.mjs` without `--quick` runs every width (1920, 1366, 768), both themes and both examples (about 25 minutes). `npm run check:layout:wide` is the long run (three modes, seven windows, both examples); its baseline (`baseline-wide.json`) is not written yet. `CHECK_PAGES="Customer Engagement" npm run check:layout` runs one page; a finding of a sub-pixel size can come and go between runs. Rewrite a baseline only by the owner's decision. What the check measures: `layout-rules.md`, section 18. For a floating card of questions, `npm run check:card` opens the card (`CARD_OPEN="<tile name>"`, `BASE_URL` for a running app; the other variables are in the head of `tools/scripts/layout-check/floating-card-audit.mjs`) in sepia, light and dark at 1440 wide and in sepia at 520, and checks the pattern of `tile-and-card-pattern.md`.
6. **Look at it** in a browser as the owner sees it, in the way `review-checklist.md` says; the automatic checks do not replace it. `npm run tauri dev` runs the same frontend in the desktop shell.
7. **Documents:** the log row in `../design/core/04-log.md`, the rule if a rule changed, the examples if the interface changed (`src/data/examples/`, below), then `npm run docs:index`.
8. **Commit** only what was changed. Do not push, merge or tag without the owner's yes.

## What the unit tests cover, and what they do not

Vitest is the only unit-test layer: parsing, number and date logic, data transforms, what a component or a hook computes, the generated documents, and the examples (`ExampleDrift`, `ExampleCompleteness`, the golden files). `environment: "jsdom"` is set in `vitest.config.ts` (a separate file from `vite.config.ts`, whose `server` block is for Tauri). A test stands beside what it tests; tests that cross components are in `components/interview/tests/`.

Document tests: `src/docs/documentReferences.test.ts` (the rulebook, `customer-engagement-layout.md`, `tile-and-card-pattern.md`, `card-kinds.md`, the page 3 specification, doc 1 and doc 26 name only properties, classes and files the code has), `documentValues.test.ts` and `documentAssets.test.ts` (the generated parts of the rulebook). Run them with `npx vitest run src/docs` after editing any of these documents.

A green run proves the logic, not the look. How the app renders and responds to the pointer is checked by the layout check and by looking (steps 5 and 6).

To rewrite the examples after an interface change: `UPDATE_EXAMPLES=1 npx vitest run src/services/ExampleDrift.test.ts` (it writes both examples, in `src/data/examples/`, from the app's own readers); the golden figures are rewritten with `WRITE_GOLDEN=all`.

## The screen snapshot

Before and after a change that must not change the screen (code moved between files, a component split, a style rule removed), take the screen snapshot and compare: `node tools/scripts/layout-check/style-snapshot.mjs --out exports/snapshots/before.json` (make `exports/snapshots/` first: `mkdir -p exports/snapshots`), the change, the same with `after.json`, then `--compare exports/snapshots/before.json exports/snapshots/after.json`. It records the final style of every drawn element (about 70 properties): on every Foundation page, in every section tile's dialog and in the first three floating cards of each tile, for both examples, in Light, Dark and Sepia; and on every page of every other System (found from `src/data/systems.ts`), in Light (`--foundation` for the Foundation pages only). About 650 scenes and 115,000 elements in about 6 minutes, four pages side by side (`SNAPSHOT_WORKERS`), with a fixed clock and no transitions, so two runs of the same code are the same. It needs the dev server; do not edit `src/` while it runs (the dev server reloads). It does not see a state under the pointer or the focus, or a card opened inside a dialog (a Goal in a Theme): the layout check's reactions and its cards added with + do.

**What an `!important` overrides**: `node tools/scripts/lint/css-important.mjs` opens the Foundation pages, their dialogs and the first floating card of each tile, and lists for each `!important` declaration the declarations of other rules it beats on the elements it applies to (`--json FILE` writes them all). One with no rival is a candidate to remove, and the screen snapshot and the layout check prove it (an `!important` that wins over a rule in a state the tool does not open, a completed card, a Goal in a Theme, is found by them); one with rivals goes only once its rival is corrected at its source.

**The page snapshot test** (`src/pages/examplePages.test.tsx`): every page of the Identity, Brand, Business, Strategy and Operations Systems, and every section tile's dialog, opened with both examples; what each reads is kept in `src/pages/__snapshots__/`. A change that means to change what a page says updates it with `npx vitest run src/pages/examplePages.test.tsx -u` and says so in the log.

**The rules-in-force summaries**: `npm run docs:in-force` writes, at the top of the rulebook and of doc 26, a summary from their own text (`npm run docs:check` fails where one is stale).

## Finding where something is styled

`npm run css:where <class>` lists every rule that names a class (file, line, selector, what it sets; `-- --props` with the values); `npm run css:map <words>` lists the headed blocks of the stylesheets about a topic, in the order they load. The rules stay where they are: their order decides which wins.

## The console walk

`npm run check:console` opens every Foundation page of both examples with every tile's dialog and reports what the browser console, the page and the network said (errors, warnings, uncaught exceptions, failed requests); it fails on any. Run it after a change to how a page is built, as the layout check shows how a page looks and this shows whether it throws. It starts the dev server itself when none answers.

## The app files alone

`npm run export:app` copies the app's own files (no tests, documents, tools or catalogue) into `exports/app/` (ignored by git) and builds them there; `-- --clean` also installs in that folder alone. It fails, naming the file, if an app file imports something that was left out. See `docs/design/current/25-folder-plan.md`.

## Before every commit

A git hook (`.githooks/pre-commit`) runs the three quick checks, about 15 seconds: `npx tsc --noEmit`, `npm run lint:css` and `npm run docs:check`. A failure stops the commit. Git finds the hook through `core.hooksPath`, which `npm install` sets (the `prepare` script). Never skip it (`--no-verify`): fix what it reports.

## Continuous integration

`.github/workflows/ci.yml` runs on every push and every pull request into `main`: typecheck, unit tests, build, and the checks that need no browser (`tokens:check`, `lint:styles`, `lint:controls`, `lint:css`, `docs:check`, `tables:check`, `library:check`). A second job, `layout`, runs the layout check in headless Chromium on pull requests and when started by hand (`workflow_dispatch`). It is a floor: a person still reads a failure. `lint:controls` (`tools/scripts/lint/shared-controls.mjs`, baseline `shared-controls-baseline.json`) fails when a stylesheet other than a shared control's own sets that control's look (ground, line, letters, height, padding); the second looks that exist are listed in the baseline file: remove them, do not add. The layout check waits for the fonts and multiplies its waits by `CHECK_SLOW` (default 1.5; 3 on a busy machine).

## Common failure modes

- **The dev server port is fixed:** `vite.config.ts` sets `port: 1420` with `strictPort: true` because Tauri expects it. A stale process holding 1420 makes `npm run dev` fail; stop it, do not change the port.
- **Two groups of tests** (`vitest.config.ts`): `logic` (the framework, the library, the documents' and the stylesheets' checks) runs in plain Node, `dom` (everything that draws or uses storage) in jsdom, each file in its own. A test of a stylesheet's text is written only where no rule of the layout probe measures the same thing in the browser.
- **Slow machine, timeouts:** the tests carry a 40-second timeout in `vitest.config.ts`; the layout check checks four pages side by side (`CHECK_WORKERS`, 4 by default; each page in a browser context of its own, its example seeded afresh) and takes about 3 minutes; it must run alone (`CHECK_WORKERS=2 CHECK_SLOW=3` on a busy machine). It ends by saying how many pages it checked.
- **Package versions:** Playwright is pinned (1.64.1): a newer one needs its own browser downloaded before the checks run (`npx playwright install chromium`). The Tauri packages (`@tauri-apps/cli`, `@tauri-apps/plugin-opener`) move only together with their Rust crates in `src-tauri/Cargo.lock`, or the desktop build stops on the mismatch.
- **Filename guesses fail:** a System's file triad is not named alike everywhere (`framework-dsl-grammar.md`, "File triad"). List the directory first.
- **A test looks wrong but the app is right:** check whether the assertion's assumption (an old label, a stale fixture) is what is stale. Decide which side is wrong before fixing either.
- **A test of a document fails after a rename:** `documentReferences.test.ts` fails when one of its documents names a property, class or file the code does not have (a bare file name such as `21-shared-components.md` is read as a file: write "doc 21" instead); fix the document's reference, not the test.

## How to triage a red result

1. Check the list below first. If the failure is listed and its reason still applies, it is expected.
2. If it is listed but the reason may no longer apply (the file was touched by this change), re-verify.
3. If it is new, root-cause it before shipping: read what the assertion checks and decide whether the app or the assertion is wrong. Add it below only when sure.
4. Update this list in the same session. A stale list invites waving away a real regression.

Where practical, an expected failure is also marked in the test itself (`it.fails`), because a mark in the code drifts less than a line in a document.

## Currently known expected failures

None today. (The last one, the cursor after a pasted numbered block whose renumbering adds a digit, `useListAutoFormat`, was fixed on 2026-11-10; its test is a plain test again.)

Everything is expected to be green.

## Stability

This file changes when the toolchain changes (a script, a port, a build layout) and when a failure is triaged. If a step stops matching reality, fix this file in the same session.
