# The whole app reviewed: what could be improved or made faster (2026-11-21)

Status: **proposal**, written 2026-11-21. Asked by the owner on 2026-11-21 23:53 UTC+2: "Make a total review, and check what else could be improved, optimised to the app (docs, code, tests, etc)." Every figure below was measured on `main` at `84e2430c` (the build, the test run, the unused-code scan with `knip`, `npm audit`, `npm outdated`, the layout baselines, the GitHub branches). Nothing here is built; each item says what it would take, and the owner picks. The future features are scored in Guide 2, 5.7; the not-built list is Records 2.

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
| R1 | 37 old branches stay on GitHub: 33 are merged into `main`, and the other 4 hold only changes already in `main` (`git cherry` finds none left: `feat/cards-review-2026-11-19`, `feat/choice-questions`, `feat/foundation-engagement-page`, `feat/registrations-and-expenses`). | Delete all 37, and turn on GitHub's "Automatically delete head branches" (Settings, General) so a merged branch goes by itself. | S |
| R2 | CI runs the full verify job twice for every pull request: once for the push to the branch (`push: branches: ["**"]`) and once for the pull request. | Run `push` on `main` only, and add a `concurrency` group that cancels a run a newer push replaces. Half the CI minutes, the same checks. | S |
| R3 | Three tools packages are used but not declared: `postcss` (three CSS lints), `esbuild` (two scripts), `playwright-core` (the floating-card audit). They work only because another package brings them. | Add `postcss` and `esbuild` to `devDependencies` at the versions installed today; read `playwright-core` through `playwright`. | S |

## 2. Speed of the app

| # | Finding (measured) | Proposal | Effort |
|---|---|---|---|
| S1 | The production build has two scripts over the 500 KB warning: `Conversation` (681 KB) and `FrameworkRegistry` (500 KB). `FrameworkRegistry` loads every system's Markdown at once (`import.meta.glob` with `eager: true`, five times), Systems 05 to 24 included. | Load each system's Markdown when its page opens (the glob without `eager`, one chunk per system). The first page then waits only for its own text. | M |
| S2 | `Conversation` (681 KB) holds every editor in one chunk (Records 2, 5.6, Optimisation). | Split the editors by page with `lazy()`, as the Notes and the Calendar are since PR #82. Measure before and after. | M |
| S3 | `loadDocument` parses the whole Organisation's JSON on every call, and 38 places call it. | Keep the last parsed document per Organisation and drop it on save (one owner: `LocalOrganizationStore`). | S |
| S4 | Two style sheets are large: 190 KB and 181 KB (and 77 KB); 232 `!important` rules remain. | Keep the `!important` map (`css-important.mjs`) going down one sheet at a time, with the layout check after each. | M, ongoing |

## 3. The code

| # | Finding (measured) | Proposal | Effort |
|---|---|---|---|
| C1 | Ten hand-written files are over 1,200 lines (the generated library tables aside), the largest `DynamicTable.tsx` (1,800), `Conversation.tsx` (1,642), `useCapabilityActivityAndDelivery.tsx` (1,557), `AnswerBusinessCapability.ts` (1,541) and `FrameworkInterpreter.ts` (1,461). | Split by topic, as `FinancialModel.ts` was on 2026-11-10 (the same code, one topic per file, the old file re-exporting). One file per pull request, tests unchanged. | M each |
| C2 | The old non-tile layout under `asTiles` is still reachable in four editors (Records 2, 5.3). | Find which screens open it; remove it where none does. Removes several hundred lines. | M |
| C3 | 13 exports are used by tests only (for example `findPlaces`, `clearFieldRegistry`, `createOwnCost`), and two functions are built but on no screen (`whatItWouldTake`, `loanRepaymentNotes`: Guide 2, 5.5, rows 15 and 16). | Keep the test-only ones (they test real code paths). Wire the two in, or leave them on the future list. | S |
| C4 | `npm audit` finds no vulnerability. Five tools have a new major version: Vite 8, Vitest 5, TypeScript 7, `@vitejs/plugin-react` 6, `jsdom` 31; three have small updates (`@tauri-apps/cli`, `@tauri-apps/plugin-opener`, `react-router-dom`). | Take the small updates now; the majors on one branch of their own, with the full tests and the layout check. | S, then M |

## 4. The layout and accessibility checks

| # | Finding (measured) | Proposal | Effort |
|---|---|---|---|
| L1 | The wide layout check's baseline accepts 6,553 findings (2.8 MB), so it reports only new ones and hides these: 1,717 buttons smaller than 24 px with no 24 px click area (WCAG 2.2, 2.5.8), 956 "every master tile has one side", 763 "the Completed tile's ground is a neutral grey", 417 row gaps, 314 tile contents outside the square. Most are at 1024 x 768 and 768 x 1024. | Fix by rule at the shared component, largest group first (the 24 px target: one rule in the shared button styles), then rewrite the baseline. Also Guide 2, 5.5, row 14. | L, in steps |
| L2 | The standard baseline holds 31 findings, all of them the same 24 px target rule. | Falls with L1's first step. | (L1) |

## 5. The tests

| # | Finding (measured) | Proposal | Effort |
|---|---|---|---|
| T1 | 200 files, 2,311 passing; 166 s of test time spread over the workers. The slowest: `examplePages` (16 s), `SectionTiles` (10.6 s), `FloatingCards` (8.1 s), then six between 4.6 and 6.7 s. | Split `examplePages` by example (each runs on its own worker), and check whether the tile tests render a whole page where one chapter would do. | S |
| T2 | The skipped two are the on-demand writers (`UPDATE_EXAMPLES`, `WRITE_GOLDEN`); the content-links test's known list is empty. | Nothing to do. | — |
| T3 | No coverage figure exists, so nobody can see which code no test reaches. | Run `vitest --coverage` once, record it in the tests guide, and add tests only where an engine rule has none. | S |
| T4 | The tests guide (Testing 1, 239 KB) lists every test by hand; it drifts each time a test is added. | Generate its lists from the test names (as Questions 6 is), and check them in `docs:check`. | M |

## 6. The documents

| # | Finding (measured) | Proposal | Effort |
|---|---|---|---|
| D1 | 108 documents, 5.2 MB. The largest is the layout rules (AI 9, 352 KB), which the rules say to read before every UI change. | Split AI 9 by subject (tiles, cards, rails, dialogs, colours, sizes) into numbered parts, the rule ids unchanged, so a change reads only its part. | M |
| D2 | Foundation 2 (300 KB) and the catalogue record (Records 3, 140 KB) repeat one template per card. | Leave as they are: the catalogue tool reads their table shapes (Records 2, 5.11). | — |
| D3 | The log (Records 1) is 149 KB after four days. | Archive its rows each week, as the rows before 2026-11-18 are. | S |
| D4 | 66 "*Read by (not built yet)*" lines across Questions 7 to 16 (now counted in Records 2, 5.12) and three questions nothing reads. | The owner names a reader for the three, or keeps them as context. | — |

## 7. What is in good order

No known vulnerability; no `TODO` or `FIXME` left in the code; the unused code removed (PRs #95 and #96); every document meets the standard and the docs check is green; one list of what is not built (Records 2); the examples and the country lists already load on demand.

## 8. Suggested order

1. **Small and safe, one pull request:** R1, R2, R3, C4's small updates, S3, T1, D3.
2. **Speed:** S1, then S2, each measured before and after.
3. **Accessibility:** L1, the 24 px target first.
4. **Tidy:** C2, then C1 one file at a time; T4; D1.
5. **Tool majors:** C4's majors on their own branch.
