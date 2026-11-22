# The whole app reviewed: what could be improved or made faster (2026-11-21)

Status: **proposal**, written 2026-11-21. Asked by the owner on 2026-11-21 23:53 UTC+2: "Make a total review, and check what else could be improved, optimised to the app (docs, code, tests, etc)." Every figure below was measured on `main` at `84e2430c` (the build, the test run, the unused-code scan with `knip`, `npm audit`, `npm outdated`, the layout baselines, the GitHub branches). Each item says what it would take; the owner chose on 2026-11-21 00:04 UTC+2 ("Start fixing what is on the last list, besides the Accessibility"), and an item's last column says **Done** with its date once it is built. The future features are scored in Guide 2, 5.7; the not-built list is Records 2.

**Contents**

- [1. The repository](#1-the-repository)
- [2. Speed of the app](#2-speed-of-the-app)
- [3. The code](#3-the-code)
- [4. The layout and accessibility checks](#4-the-layout-and-accessibility-checks)
- [5. The tests](#5-the-tests)
- [6. The documents](#6-the-documents)
- [7. What is in good order](#7-what-is-in-good-order)
- [8. Suggested order](#8-suggested-order)

## 1. The repository

| # | Finding (measured) | Proposal | Effort |
|---|---|---|---|
| R1 | 37 old branches stay on GitHub: 33 are merged into `main`, and the other 4 hold only changes already in `main` (`git cherry` finds none left: `feat/cards-review-2026-11-19`, `feat/choice-questions`, `feat/foundation-engagement-page`, `feat/registrations-and-expenses`). | Delete all 37, and turn on GitHub's "Automatically delete head branches" (Settings, General) so a merged branch goes by itself. | S; the owner said yes, 2026-11-22 00:11 UTC+2 |
| R2 | CI runs the full verify job twice for every pull request: once for the push to the branch (`push: branches: ["**"]`) and once for the pull request. | Run `push` on `main` only, and add a `concurrency` group that cancels a run a newer push replaces. Half the CI minutes, the same checks. | **Done** 2026-11-22 |
| R3 | Three tools packages are used but not declared: `postcss` (three CSS lints), `esbuild` (two scripts), `playwright-core` (the floating-card audit). They work only because another package brings them. | Add `postcss` and `esbuild` to `devDependencies` at the versions installed today; declare `playwright-core` at the pinned Playwright version. | **Done** 2026-11-22 (`postcss` ^8.5.33, `esbuild` ^0.28.2, `playwright-core` 1.64.1) |

## 2. Speed of the app

| # | Finding (measured) | Proposal | Effort |
|---|---|---|---|
| S1 | The production build has two scripts over the 500 KB warning: `Conversation` (681 KB) and `FrameworkRegistry` (500 KB). **Corrected 2026-11-22, measured from the build's source map:** the Markdown is a small part of `FrameworkRegistry` (the largest file of it, the introduction, is 13 KB); the chunk is the business engine (the choices 248 KB of source, the answers 190 KB, the financial model 185 KB), which every Business page needs. | Nothing to gain by loading the Markdown later. Leave the engine as one chunk. | — |
| S2 | `Conversation` (681 KB) holds every editor in one chunk (Records 2, 5.6, Optimisation): the editors are 1.78 MB of its source. | Split the editors by page with `lazy()`, as the Notes and the Calendar are since PR #82. The app reads it from the disk (desktop) or the local server, so the gain is a fraction of a second on the first page; every page test would then wait for its editor. Worth it only before a hosted web version. | M, not now |
| S3 | `loadDocument` parses the whole Organisation's JSON on every call, and 38 places call it. | Keep the last parsed document per Organisation and drop it on save (one owner: `LocalOrganizationStore`). | **Done** 2026-11-22: parsed again only when the stored text changes (a new test) |
| S4 | Two style sheets are large: 190 KB and 181 KB (and 77 KB); 232 `!important` rules remain. | Keep the `!important` map (`css-important.mjs`) going down one sheet at a time, with the layout check after each. | M, ongoing |

## 3. The code

| # | Finding (measured) | Proposal | Effort |
|---|---|---|---|
| C1 | Ten hand-written files are over 1,200 lines (the generated library tables aside), the largest `DynamicTable.tsx` (1,800), `Conversation.tsx` (1,642), `useCapabilityActivityAndDelivery.tsx` (1,557), `AnswerBusinessCapability.ts` (1,541) and `FrameworkInterpreter.ts` (1,461). | Split by topic, as `FinancialModel.ts` was on 2026-11-10 (the same code, one topic per file, the old file re-exporting). One file per pull request, tests unchanged. | M each; in progress: `DynamicTable.tsx` split 2026-11-22 (1,800 to 1,085 lines; `dynamicTableTypes.ts`, `dynamicTableRows.ts`, `useColumnWidths.ts`) |
| C2 | The old non-tile layout under `asTiles` is still reachable in four editors (Records 2, 5.3). | Find which screens open it; remove it where none does. Removes several hundred lines. | M |
| C3 | 13 exports are used by tests only (for example `findPlaces`, `clearFieldRegistry`, `createOwnCost`), and two functions are built but on no screen (`whatItWouldTake`, `loanRepaymentNotes`: Guide 2, 5.5, rows 15 and 16). | Keep the test-only ones (they test real code paths). Wire the two in, or leave them on the future list. | S |
| C4 | `npm audit` finds no vulnerability. Five tools have a new major version: Vite 8, Vitest 5, TypeScript 7, `@vitejs/plugin-react` 6, `jsdom` 31; three have small updates (`@tauri-apps/cli`, `@tauri-apps/plugin-opener`, `react-router-dom`). | Take the small updates now; the majors on one branch of their own, with the full tests and the layout check. | `react-router-dom` 7.18.6 **done** 2026-11-22; the two Tauri packages wait for their Rust crates (they move only together with `src-tauri/Cargo.lock`, AI 3, "Package versions"), which the desktop build on this PC cannot rebuild today; the majors M |

## 4. The layout and accessibility checks

| # | Finding (measured) | Proposal | Effort |
|---|---|---|---|
| L1 | The wide layout check's baseline accepts 6,553 findings (2.8 MB), so it reports only new ones and hides these: 1,717 buttons smaller than 24 px with no 24 px click area (WCAG 2.2, 2.5.8), 956 "every master tile has one side", 763 "the Completed tile's ground is a neutral grey", 417 row gaps, 314 tile contents outside the square. Most are at 1024 x 768 and 768 x 1024. | Fix by rule at the shared component, largest group first (the 24 px target: one rule in the shared button styles), then rewrite the baseline. Also Guide 2, 5.5, row 14. | Baseline **rewritten** 2026-11-22 (owner, 00:42 UTC+2: "rewrite the baselines"): 3,856 findings from 6,553, 33 rules from 40. Top: the Completed tile's grey ground 763, the 24 px target 397 (from 1,717: 162 tile links, 142 Back arrows, 48 Segment tile links, 21 column-tile links; 204 on Foundation & Engagement; mostly at 768, 1024 and 1366 wide), one side for every master tile 374 (from 956), a tile's content inside its square 314, a tile's list under its title 264. The fixes by rule wait for the owner (the 24 px idea: every small button keeps its look and gains a 24 px click area where it touches no other, owner 2026-11-22 00:10 UTC+2) |
| L2 | The standard baseline holds 31 findings, all of them the same 24 px target rule (Quillfield, 1920 x 1000, light: 17 "show only what … is connected to" buttons, 14 tile links). | Falls with L1's first step. | Rewritten 2026-11-22: the same 31 |
| L3 | **Found 2026-11-22:** the wide check does not find the same things twice. The run that confirmed the rewritten baseline met only 1,259 of the 3,856 findings the run before it had written (it found nothing new). Its counts are an upper limit, and a fix cannot be proven by one run. | Find which rules change between runs (timing, fonts, animations at small windows), make them wait for a still page, then rewrite the wide baseline once more. | M |

## 5. The tests

| # | Finding (measured) | Proposal | Effort |
|---|---|---|---|
| T1 | 200 files, 2,311 passing; 166 s of test time spread over the workers. The slowest: `examplePages` (16 s), `SectionTiles` (10.6 s), `FloatingCards` (8.1 s), then six between 4.6 and 6.7 s. | Split `examplePages` by example (each runs on its own worker), and check whether the tile tests render a whole page where one chapter would do. | Split **done** 2026-11-22 (`examplePages.lumen` and `.quillfield`, the 222 snapshots the same); the tile tests M |
| T2 | The skipped two are the on-demand writers (`UPDATE_EXAMPLES`, `WRITE_GOLDEN`); the content-links test's known list is empty. | Nothing to do. | — |
| T3 | No coverage figure existed. **Measured 2026-11-22** (`@vitest/coverage-v8`, not installed in the project): 79.0% of lines, 72.7% of branches, 77.8% of functions. Lowest with more than 80 lines: `renderListAnswers.tsx` 0% (the checklist and card-list answers of Systems 05 to 24), the Process Library 13 to 46%, `AnswerExport.ts` 25%, `CalendarTaskService.ts` 27%, `jumpTo.ts` 28%, `Landing.tsx` 35%, `ExportFlow.tsx` 45%. | Recorded in the tests guide. Add tests for the export (`AnswerExport`, `ExportFlow`) and `jumpTo`; leave the Systems 05 to 24 parts, which the extraction leaves behind (Records 2, 5.7). | **Done** (measured); the new tests M |
| T4 | The tests guide (Testing 1, 239 KB) lists every test by hand; it drifts each time a test is added. | Generate its lists from the test names (as Questions 6 is), and check them in `docs:check`. | **Done** 2026-11-22, in part: a test (`src/docs/testsGuide.test.ts`) fails when a test file is added, moved or removed without the guide, or the guide's file count is wrong; the per-test lines stay hand-written (a generator would lose the guide's grouping and wording) |

## 6. The documents

| # | Finding (measured) | Proposal | Effort |
|---|---|---|---|
| D1 | 108 documents, 5.2 MB. The largest is the layout rules (AI 9, 352 KB), which the rules say to read before every UI change. | Split AI 9 by subject (tiles, cards, rails, dialogs, colours, sizes) into numbered parts, the rule ids unchanged, so a change reads only its part. | M |
| D2 | Foundation 2 (300 KB) and the catalogue record (Records 3, 140 KB) repeat one template per card. | Leave as they are: the catalogue tool reads their table shapes (Records 2, 5.11). | — |
| D3 | The log (Records 1) is 149 KB after four days. | Archive its rows each week, as the rows before 2026-11-18 are. | Nothing to move yet: the log holds only this week (2026-11-18 on); the next archive is due on 2026-11-25 |
| D4 | 66 "*Read by (not built yet)*" lines across Questions 7 to 16 (now counted in Records 2, 5.12) and three questions nothing reads. | The owner names a reader for the three, or keeps them as context. | — |

## 7. What is in good order

No known vulnerability; no `TODO` or `FIXME` left in the code; the unused code removed (PRs #95 and #96); every document meets the standard and the docs check is green; one list of what is not built (Records 2); the examples and the country lists already load on demand.

## 8. Suggested order

1. **Small and safe, one pull request:** R1, R2, R3, C4's small updates, S3, T1, D3 (done 2026-11-22 but R1, which waits for the PC).
2. **Speed:** S1 needs nothing (corrected); S2 only before a hosted web version.
3. **Accessibility:** L1, the 24 px target first (owner, 2026-11-22 00:10 UTC+2: every small button keeps its look and gains a 24 px click area where it touches no other).
4. **Tidy:** C2, then C1 one file at a time; T4; D1.
5. **Tool majors:** C4's majors on their own branch.
