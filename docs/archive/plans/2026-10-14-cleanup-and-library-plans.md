# The clean-up and library plans of 2026-10-14 (archive)

Status: **archive**, written 2026-10-14, moved here from `design/records/05-not-done-yet.md` on 2026-10-21. These are the plans for the light clean-up (5.6), the triage of the layout check's first baseline (5.11), the open points after the arrows and rails work (5.12), the library automation (5.13) and the sizes left for the owner (5.14). The clean-up and the library automation steps 1 to 4 were built (see the log, `design/records/04-log.md`, and `design/library/08-library-system.md`); the section numbers are kept because code comments and scripts cite them ("docs/design/05, 5.13" means 5.13 here). What was not done is listed in `design/records/05-not-done-yet.md`, "Library and clean-up: what is left". The figures are those of 2026-10-14, not today's.

## 5.6 Clean-up, optimisation and asset library (plan)

### Ground rules for both actions

- **Content and logic only, never a visible change.** The clean-up must not change how any page looks or behaves (rule: keep the existing layout, style and structure). The proof is the automatic layout check plus before/after screenshots of every page.
- **Shared components and tokens, not per-page tweaks.** A problem found on one card is fixed where the card type is defined.
- **Project documents are Markdown (.md).** PDFs are only exports and do not live in the project.
- **One step, one commit.** After each step: `tsc`, `npm test`, `npm run build`, and the quick layout check must pass. Any step can be reverted alone.
- **Nothing is deleted without your confirmation of the list.**

### Action 1: clean-up round

Reading note: steps 1, 2, 3, 6 and 7 run **now** (they are prerequisites for the library). Steps 4, 5 and 8 (CSS coverage, colours and breakpoints, unused code) move to the full clean-up and optimisation after the Foundation is completed (section 5.1, phase 4), because finishing the Tile System will change the stylesheets anyway.

### What the project looks like today (measured 2026-10-14)

| Area | Finding |
|---|---|
| Rulebook | `docs/ai/layout-rules.md` is 194 KB, 1,552 lines. Sections 1–8 are the base rules; after them come about 25 appended "Batch" and "latest" addenda that sometimes restate or overrule earlier rules. |
| Stylesheets | About 1.07 MB of CSS. `conversation.css` 439 KB, `section-tiles.css` 262 KB, `global.css` 55 KB, `organization-calendar.css` 33 KB, `colors.css` 34 KB. New rules were appended in blocks; duplicates were removed once from `section-tiles.css` (selectors that tests read were left in place). |
| Colours | 233 distinct colour tokens in `colors.css`, written by hand once for each reading mode (about 690 declarations); **41** colour literals outside it (measured again on 2026-10-14; the earlier "about 213" was a rougher count); 222 `color-mix()` uses. Four reading modes: light, sepia, dark, auto. The layout probe checks light only. |
| Breakpoints | About 55 media/container rules with inconsistent values; no stated minimum width until now (768 px is now decided). |
| Layout check baseline | 1,830 known findings, all recorded on one example (Quillfield), at 1920 px, in light mode. |
| Stale names | Docs, one test comment and the layout check still describe the old page structure (see step 6). |

Baseline findings by page: Infrastructure 661, Customer Engagement 630, Foundation 211, Organization 91, Brand 86, Strategy 62, Definition 35, Sustainability 33, Financial Foundation 17 (a few more at other window sizes).

Baseline findings by rule (top of 25+ rules): an "i" must hold 3:1 contrast between letter and ground (298); an "i" on its words' centre line (255); row gap (160); content starts at the title (127); a tile's "+" box holds 3:1 contrast (119); a section heading is the h3 size (57); tile list items are one line each (56).

Two of the three biggest groups are contrast rules. They match the WCAG 2.2 AA rule for non-text contrast, so they are real accessibility work, not cosmetic.

### The steps, in order

| # | Step | What exactly | Checked by | Risk |
|---|---|---|---|---|
| 1 | Treat the drafts | **Done 2026-10-14:** the current drafts were converted into documents 1 to 5; the HTML and PDF drafts were removed (document 4, section 4.4) | | |
| 2 | Reconcile the rulebook | **Done 2026-10-14** (`layout-rules.md` reconciled: topic sections 9 to 16, section 17 the check, Appendix A history, Appendix B still to settle) | | |
| 3 | Triage the 1,830 baseline findings | **Done in part 2026-10-14** (section 5.11: probe corrected, baseline 1,830 to 677; real defects and owner decisions wait) | | |
| 4 | Unused and duplicate CSS | Run a browser coverage pass over every page, both examples, all four modes; list selectors never used; remove them in small batches. Remove duplicate declarations in `conversation.css` as was done in `section-tiles.css`. Change the tests that read CSS text so they check behaviour or a token instead of exact text, where that can be done safely. | Coverage list reviewed; build size; layout check; screenshots. | **Highest.** CSS-reading tests and rarely opened floating cards. Batches must stay small. |
| 5 | One colour source and one breakpoint set | Move the hard-coded colours into tokens in `colors.css`; gather the theme overrides in one file; align media/container rules to the agreed set (768, 1200, and the heights 900 and 1250 from the website). | Contrast report for light, sepia, dark; layout check in all modes. | Medium |
| 6 | Docs and checks use the current structure | **Done 2026-10-14** (docs, test comment, README). The layout check already covers every chapter of a compound page (Ethics, Legal Entity and Founders & Capability are part of their pages); it reports by page, not by chapter | | |
| 7 | Widen the layout check | **Done in part 2026-10-14** (`npm run check:layout:wide` exists; the wide baseline is not written yet) | | |
| 8 | Unused code | List exports no file imports (a tool such as `knip` or `ts-prune`; to be chosen), review, remove. | `tsc`, tests, build. | Low–Medium |
| 9 | Close the round | Update `docs/ai/README.md`, `app-guide.md`, the memory notes, the example files if any interface changed, and write the result: files removed, bytes saved, findings before/after. | All gates green. | Low |

I cannot give honest numbers for how much CSS or how many findings step 3 and step 4 will remove before the coverage run and the triage. Expect that most of the 1,830 findings collapse into a few shared-component fixes, but that is a hypothesis to test in step 3.

Open decisions for this action: the 768 px floor against WCAG 1.4.10 Reflow (320 CSS px at 400 % zoom) needs a ruling once I have verified that criterion at W3C; accept as a declared exception, or support narrower windows later.

### Action 2: asset library

The goal is one place that records every kind of piece the interface is built from, with one name, one definition and one contract each, so that a new page is assembled from known assets and the checks can be tied to the contract.

### Scope (what the library covers)

The **Tile** is the root asset (the Foundation is to be formed entirely by the Tile System). Master Tile, opened cards, floating cards, nested cards, chapters (frames), tables, sections, plus the smaller shared parts the audits found repeated: pickers, info notes, option lists, date and money fields, empty states, buttons. The list of asset types is **produced by step A1 from the code**, not assumed.

### Steps

| # | Step | Output |
|---|---|---|
| A1 | Inventory from the code | For each asset type: component name, where used (pages), CSS class family, duplicates (two components doing the same job). |
| A2 | Names and hierarchy | One proposed hierarchy: Framework > System > Page > Chapter (frame) > Master Tile > opened card or floating card > nested card > field; tables and sections placed where they occur. You approve the names before anything else is written. |
| A3 | Merge duplicates | Where two components do one job, one shared component. Visible result unchanged; checked by the layout check and screenshots. |
| A4 | Write the contract per asset | One short entry per asset (below). |
| A5 | Fold the rules in | Each rule from the cleaned rulebook moves to the asset it governs. Tie each contract line to the layout-check rule that tests it. |
| A6 | Retire overlapping documents | `docs/ai/asset-library.md` becomes the single description. `tile-and-card-pattern.md` and `card-kinds.md` are absorbed (they stay until you approve). `layout-rules.md` keeps only the page-wide tokens and the check. |

Where to record it: `docs/ai/asset-library.md` (Markdown, in the project).

### The contract per asset, kept simple

One entry per asset, seven lines, one sentence each:

| Line | Question it answers |
|---|---|
| Function | What does it hold, and which function reads it? |
| Presentation | Which shared pattern is it (tile, frame, card, floating card, table)? |
| Layout | Which grid, sizes and rails (by reference to the token, not numbers copied)? |
| Style | Which tokens only? |
| Screens | Behaviour per class (below). |
| Modes | Light, sepia, dark, auto: what must hold in all of them. |
| Accessibility | Which WCAG 2.2 AA checks apply. |

Screen classes proposed (width and height; from the website profiles and cross-checked with Android's window size classes):

| Class | Width | Height | Notes |
|---|---|---|---|
| Below minimum | under 768 | any | Not supported by the app. |
| Tablet | 768–1199 | any | Continuous scroll. |
| Laptop | 1200 and up | under 1250 | Header and section gaps tighten under 900. |
| Desktop | 1200 and up | 1250 and up | Full composition. |

WCAG 2.2 AA checks to attach to the contracts (confirmed by W3C "What's New in WCAG 2.2"): focus not obscured (2.4.11), dragging movements have a non-drag alternative (2.5.7, only if the app has a drag action), target size 24 px (2.5.8), accessible authentication (3.3.8, not applicable: the app has no sign-in). Text contrast 4.5:1 and non-text contrast 3:1 are also AA, as are reflow (1.4.10) and text spacing (1.4.12); those two I still have to verify at W3C.

### What optimisation includes (proposal, with measurements)

Optimising is not guessed here. It means improving these six things, each with a measurement taken before and after, in the same order as the ISO/IEC 25010 quality characteristics of *performance efficiency* and *maintainability* (modularity, reusability):

| # | Area | Today (measured 2026-10-14) | Action | Measured by |
|---|---|---|---|---|
| 1 | Load | `Conversation` 662 KB, `Landing` 396 KB, `FrameworkRegistry` 383 KB, main 236 KB (minified, before compression). The two examples (352 KB and 228 KB of JSON) are bundled into `Landing`. Only the page routes are lazy; every editor is in one chunk. | Load examples on demand; lazy-load each editor by answer type; split by system. | `npm run build` sizes, before and after |
| 2 | Run | The biggest editors have no memoisation (`BusinessEngagementEditor` 4,230 lines, `BusinessCapabilityEditor` 5,766 lines) and re-render on every key. | Profile with the React Profiler; split into per-card parts; memoise only where the profile shows it. | Interaction time per keystroke on the biggest page; target "good" Interaction to Next Paint is 200 ms or less |
| 3 | Style | 1.07 MB of CSS; about 213 hard-coded colours; duplicates | Coverage purge, tokens, one breakpoint set (clean-up steps 4–5) | CSS bytes; contrast report; layout check |
| 4 | Code | 10 source files over 2,000 lines (`AnswerUtils` 9,099 lines is one utility file for everything); duplicated helpers (`round`, `normalize`, `toIsoDate`, `readNumber`, `shortMonth`, `systemTitle` and others); dead non-tile paths; stale `Operations` and social-media branches in `Conversation` | Split by domain; one shared `dates` and `ids` helper; delete dead paths | Lines per file; duplicates list; `tsc`, tests |
| 5 | Tests and checks | 131 test files, 1,355 passing and 1 known expected failure, 44 s; layout check about 25 min | Keep the speed; widen the layout check (768, sepia, dark) | Time; findings |
| 6 | Docs | A comment says "~470 KB" of Markdown; it is 153 KB. Rulebook 194 KB | Correct; fold the rulebook into the library | Review |

Reference points: web.dev gives the "good" thresholds for Core Web Vitals (Largest Contentful Paint 2.5 s, Interaction to Next Paint 200 ms, Cumulative Layout Shift 0.1), measured on field data. Bundle-size limits have **no official value**; the figures in the search results (150–200 KB compressed for the first load) are third-party suggestions, so the limit for this app is a team choice to set after the first measurement.

Dependencies are already lean (four runtime packages: React, ReactDOM, React Router, a font), so optimising dependencies is not a task.

## 5.11 Layout check: triage of the 1,830 known findings (2026-10-14)

The baseline of the quick check (Quillfield, 1920 px, light) held 1,830 findings in 70 rules. Each rule was read in the probe (`scripts/layout-check/layout-probe.js`) and in the code that produces the finding, and put in one class.

| Class | Meaning | Rules | Findings |
|---|---|---|---|
| A | Real defect: the UI breaks the intent of a right rule | 8 | 365 |
| B | The probe measured the wrong thing or too strictly | 27 | 1,207 |
| C | The rule or its number is stale against the code | 23 | 177 |
| D | Accepted: a declared exception | 6 | 27 |
| U | The owner decides | 6 | 54 |

**Done (changes to the check and the rulebook only; nothing the user sees):**
- An "i" and a "+" box are measured on the ground they stand on, not on their own transparent background. This cleared the 298 "i holds 3:1" and the 119 "+ box holds 3:1" findings; the real contrast of every "i" on the Business pages is 5.7:1 or more in light, sepia and dark (measured).
- The squeezed Inventory and Completed row (titles only, by design), the text lists of the column pages, the Customer Engagement reference rows, the Legal Entity side fields and unframed sections, the Performer's picker (8px short of its x) and the focus on a card without a name box are declared exceptions in the probe.
- The dialog header: the slash is 6px in the trail of views and 8px after the root title; the names are the body size (probe and rulebook).
- The standard baseline was rewritten from 1,830 to 677 findings. One rule (the "i" contrast) gave 33 findings in one run and none in two others, so those 33 were removed as noise: that rule can flicker while a card is animating.
- The wide check (`npm run check:layout:wide`) exists; its first sample (sepia, 768 × 1024 and 1440 × 864, one page) found 381 findings, so the **wide baseline has not been written yet**. A full wide run covers 3 modes × 7 windows × 2 examples and takes hours.

**The real defects and the decisions, after checking each by hand (second pass, 2026-10-14).** The first pass took its numbers from the triage agents. Each was then measured in the running app (Quillfield, 1920 × 1000, light), and several were wrong.

| Item | What I measured | State |
|---|---|---|
| A tile's list stays clear of its "+" box | On the Resources tiles the list ended 3.3px below the top of the "+" (Infrastructure, Offering's Capability). | **Fixed.** The list may now run 5px past its row, to the top of the "+" and not under it (`SectionTiles.tsx`). One visible change: a Resources tile with nine items shows 6 whole lines, not 7; the rest scrolls. |
| The remove x has two reds | A cell's x was `#b00020`; a card's x was `#d01818` (a rule kept "the previous default red"). The Goal, Objective and Metric x also had an 8px corner, caught by a rule meant for boxes (`[class*="strategy-"][class*="-box"]` matched the name `strategy-box-remove`), where every other x has 6px. | **Fixed.** One red for every x, the danger text red of the reading mode (`remove-button.css`, the override is deleted); one corner. The test that asserted the override now asserts there is none. |
| The Performer's dropdown ends past the name cell | Name cell ends at x = 1502, the dropdown at 1506, the x or "+" begins at 1514. The dropdown is 4px past the name cell and 8px from the x; the name cell is 12px from the x. The rulebook says the dropdown ends where the name cell ends; the 12px rule says nothing ends closer than 12px to the x. Both are broken by 4px. | **Fixed** (approved): the dropdown ends at the name cell's edge, 4px shorter (`section-tiles.css`, `.card-box-open .business-capability-performer > .option-picker`). |
| An "i" one gap (8px) after its words | In the Strategy card heads the "i" stands 4px after Theme, Goal, Objective and Metric. | **Fixed** (approved): `.strategy-head-kind` gap 8px. "Initiatives" (16px) is not verified. |
| An "i" on its words' centre line | In the Customer Engagement reference lists (Profiles, Offerings) the "i" is 3px above the centre of the link on 5 of 15 rows; one row has a link that wraps to two lines and its "i" stays on the first line. | **Fixed** (approved): the "i" is 3px lower in every reference row (`conversation.css`); in the one row with a wrapped link it stays on the first line. |
| The Add Performer "+" holds 3:1 | Measured on the ground it stands on: 5.9:1 in light, 6.4:1 in sepia, 5.3:1 in dark. | **Refuted.** The 2.82:1 figure was wrong, and the four findings disappeared once the check measured the ground correctly. Nothing to fix. |
| Payment plan row 1.6px low | The count box and the words beside it are both centred at 698.6px in the live app. | **Not confirmed**, probably an artefact of what the check measures as "the text". Not changed. |
| Currency and payment-plan pickers narrower than their widest option | Not measured by hand. | Unverified; **waiting**. |

No item in this list is a WCAG 2.2 AA failure.

**Questions for you (class U), in plain words:**
1. **Roadmap tile: decided.** The Roadmap is a Gantt diagram and a unique element: a **diagram tile**, a category of Master Tile of its own (`SectionTile.diagram`; rulebook section 9). The original question was: In the Strategic Period dialog the Roadmap tile is 442 × 102px with a 36px title, while the Theme tiles are 215px squares with 18px titles. Is the Roadmap tile meant to be a wide banner with a large title (as it is now), or a normal square tile? (Two findings, one cause.)
2. **Card navigation: decided and done.** The arrows are the page arrows at 15/22 size in the colour of the "+" button, their vertical sides 12px from the card's edge (the left arrow on the x's right side, the right arrow on the left side of the symbol above), centred on the Description label's line; the rail's bullets take the same tint; in the heads the "i", "+" and x are 12px apart. The original question was:
3. **A picker that wraps: fixed** (approved). It was the Type dropdown of entry 5 in the Skills list of the Jordan Ellis card (Identity, 2. Organization, chapter 2 Founders & Capability). It is now one line, cut with an ellipsis (full text in the tooltip and the open list), and runs to its cell's edge (the 6px at its right is gone). The original question was: In the Jordan Ellis card of Founders & Capability the check found one dropdown whose text takes two lines (54px high instead of 45). I could not reproduce it by hand; which dropdown is it, and should its text be shortened or the card let it grow?
4. **Focus ring after Escape: decided and done.** The owner said the ring should not exist: after Escape or Back no ring shows on the opener, however the card was opened (a trade-off with WCAG 2.4.7 for keyboard users, flagged to the owner).

**Stale rules and probe gaps still to correct** (class B and C; they stay in the baseline until then): the Back button now stands in the tab rail (45 findings); the order number is drawn inside the name cell (26); the founder card was redesigned to the 492px card, so its 18 rules in probe section 17e and the rulebook describe the old 297px card (38 findings); the row-gap rule does not know the "+ Add Customer Source" block (74 raw); the dialog-size rules do not clamp a card taller than the window (16); Qty 56px is not in the width steps; the Delivery tile "+" adds an inline row, not a floating card; the card ground in a dialog is opaque, not glass; `--founder-card-min` and the two glass tokens are unused.

## 5.12 Open after the arrows, rails and spacing work (2026-10-14)

- **The full layout check has not been run since** the label arrow, the rails, the Back button, the page tab padding and the global tracking rule. **Owner's decision (2026-10-14): no more checks for now; the asset library comes next and every kind of piece will follow one element each.** Run the check and rewrite the baseline once the library has unified the elements.
- **Old fold-arrow and title-arrow styles:** the styles of the 36px fold arrow stay in use (every other fold arrow); the `.title-arrow` styles still serve the capability overview menu only. Check for dead rules in the full clean-up (step 4).
- **The page tab:** the owner saw about 29px between the longest name and the tab's edge; measured 17px (now 13px with the 12px padding) at every width from 2200px. Ask for the window width if it persists.
- **Tracking:** every rule that sets a bold weight now adds `--bold-tracking`; rows that hold bold text on hover must be sized for it. The check will show any row that now wraps or overflows.
- **Unlit rail bullets:** their low contrast at rest is by design (owner, 2026-10-15): they are unlit until hovered or current, so it is an accepted design choice, not a defect. This closes the item. Measured by the library runner: the ice-blue plain bullets hold 1.53:1 (light), 1.58 (dark) and 1.39 (sepia) on the page; the lit and hover states and the page status shapes keep their checks.
- **PDF copies** of documents 04 and 05 (and the combined file) are older than these texts.

## 5.13 Library automation: the process (proposal, 2026-10-14)

Goal: the asset library should not be built by hand, asset by asset, with every number written in several places. The proposal is a pipeline in which **a rule is written once and everything else follows from it**: the colours of every reading mode, the sizes for every use and screen size, the documentation, the checks and the gallery. It is a proposal for the owner's decision; nothing of it is built.

### What was measured today (the case for it)

| Area | Measured |
|---|---|
| Colours | 233 distinct tokens, hand-written for light, dark (231) and sepia (228). 37 of them are the card tint (`--theme-*`, a saturation and lightness pair per mode, completed by one hue per card). 41 colour literals outside `colors.css`. |
| Sizes | Font sizes are tokens (399 uses of a variable, 9 literals). Gaps: 166 variables, **343 literals** in 18 distinct values. Corners: **4 variables, 219 literals** in 11 distinct values (8px x97, 6px x59, 4px x22, 10px x9, ...). |
| Breakpoints | 14 distinct widths and heights in the media queries (560, 600, 640, 700, 760, 900, 900.02, 1000, 1001, 1099, 1100, 1500, 1501, 1700) and 12 container queries; the decided floor is 768. |
| One rule, many places | Today's single rule "an \"i\" stands 6px after its label" touched a token, five style rules, the layout probe's expected value, the rulebook and a test. Every rule of the app is spread the same way. |
| Checks | The layout probe measures page by page on fixture content; a run takes minutes (one page) to hours (wide); the baseline holds 677 known findings; five test files read style text. |

### The principles

1. **A rule is data.** Value, reason, the assets it governs, and its check, in one record (for example `info-gap = 6px`).
2. **Everything else is generated from the record:** the CSS tokens (for all reading modes), the table in the rulebook, the constants of the probe, the contrast report, the gallery entries.
3. **Check an asset once, in a gallery, not every page.** A page is then only checked for using assets and nothing else.
4. **Make the bypass impossible:** a lint that refuses literal colours, corners, gaps and breakpoints outside the tokens, and a control that is not a known asset.

### The pipeline

| Layer | What it is | Generated from it |
|---|---|---|
| A. Token source | One typed file (`tokens.ts`), exported also as DTCG JSON. **Colour:** a few seeds per reading mode (paper, ink, neutral hue, accent) and, for each role (ground, inner, line, ink, mark, hover), a lightness and saturation per mode; a card's tint is then *hue x role x mode*. **Pairs:** every pair of roles that meet (ink on ground, mark on ground, "+" on card) with the ratio it must hold (4.5:1 text, 3:1 marks and borders). **Size:** the type scale, the spacing, three steps of corner, control sizes, the 24px hit area, and a table *size by use* (tile, card, rail, head) with *size by screen class* (S from 768, M from 1200, L from 1700; heights 900 and 1250 from the website). **Layout rules:** the numeric rules of the rulebook (12px margin, 6px label gap, "i" gap, arrow shapes, tracking) as records. | `colors.generated.css` (light, dark, sepia and auto in one pass), `sizes.generated.css` (the `@media` and `@container` blocks from the one breakpoint list), the types, the table "Values as built" of the rulebook (between markers), the probe's constants. |
| B. Generator | A small Node script in `scripts/` (no new dependency). **It fails the build when any pair misses its ratio in any reading mode** and prints the contrast report. Style Dictionary is the known alternative; it has no built-in notion of themes, so the mode blocks would be custom formats anyway, which is why the script comes first. | The above, and the report for the owner. |
| C. Asset contract | One typed record per asset (the contract of section 5.6, kept simple): name, kind, anatomy (parts), states (rest, hover, focus, open, disabled), variants, the tokens it reads, its sizes by use and screen class, its spacing, its accessibility needs (target size, contrast pairs). | The gallery entry, the asset's measured checks, its page in the documentation. |
| D. Gallery | A development-only route (`/library`) that draws every asset in every state, in every reading mode and at each screen class, on fixture content. A Playwright run reads the contract and measures: sizes, gaps, centring, the hit area, contrast of each mark against the ground it stands on, no clipping or overflow, hover and focus. axe-core covers the generic accessibility rules (it finds only part of the WCAG problems, so it is a net and not a proof). Screenshots (`toHaveScreenshot`, strict tolerance) are the second check. | A check of seconds for one asset, in all modes and sizes, instead of a page run of minutes. |
| E. Guardrails | A lint over the stylesheets (no literal colour, corner, gap or breakpoint; every control carries its asset name) and the five style-reading tests turned into tests of tokens and contracts. | The bypass closes. |
| F. Codemods | A script over the stylesheets (PostCSS) that replaces literals by tokens where the value maps exactly (gaps 6 and 12 to the spacing tokens, corners to the three steps, the 41 colours to roles, the 14 breakpoints to the list of three widths and two heights), prints the ones it cannot map for decision, and runs in small commits. | The 343 gap literals, 219 corner literals, 41 colours and 14 breakpoints reduce to the token set. |

### Order (each step one commit, as in the ground rules of 5.6)

1. **Token source and generator for colour** (A, B): the existing values read into the new file, the generated CSS proven identical to today's by a diff, then the pair table and the contrast report. *First visible result: the contrast of all roles in all modes in one table.*
2. **Breakpoints, corners and gaps** (A, B, F): one list, three corner steps; the codemod in dry run first.
3. **Gallery and runner for one trial asset** (C, D): the label arrow, because it was defined today and has a measured contract. Then the "+" box, the "i", the remove x, the rails and the Back button.
4. **Lint and the style-reading tests** (E).
5. **Asset by asset**: each asset gets its contract and its gallery entry, its page code is changed to use it, and the page checks it replaces are deleted from the probe.
6. **The page check last**: once the library covers the elements, the page check is run once, its baseline rewritten, and it shrinks to "pages use assets".

### What is not automated

Names and wording, the composition of a page (which assets sit together), and anything that is a decision of the owner. The pipeline only makes sure that a decision, once taken, is written once and cannot drift.

### Risks and how they are met

- **A generation step is added to the build.** The generated files are committed; a test fails when they differ from the source.
- **The style-reading tests break when the CSS is generated.** Step 4 converts them first; until then the generator keeps the selectors they read.
- **A contract measured on fixture content may miss a case of real content.** The gallery carries the worst-case fixtures (the longest names, nine items); the page check at the end stays as the net.
- **Browser support.** The app already uses `color-mix()` 222 times. `light-dark()` is not used: it takes two schemes and the app has three reading modes.
- **The token format is not a W3C standard.** The DTCG specification (Format, Color and Resolver modules, version 2025.10, 28 October 2025) is a Community Group report, called stable by the group. It is used as the export format so the tokens can move to the extracted app; the source stays the typed file.

### Decisions of the owner (2026-10-14: "go with your recommendations")

1. **Tokens are authored in the typed file** (`tokens.ts`), exported also as DTCG JSON.
2. **The gallery is a development-only route** in the app (`/library`).
3. **The trial asset is the label arrow**, then the "+" box, the "i", the remove x, the rails and the Back button.
4. **The lint is switched on after the codemods**, not before.
5. **The generator is a small custom Node script** in `scripts/`, with no new dependency, not Style Dictionary (it has no built-in notion of themes, so the mode blocks would be custom formats anyway). Revisit only if the tokens must feed more platforms.

Steps 1 to 3 of the order are built (2026-10-14): see the log, 4.4, and the owner's list in 5.14. Step 3 covers six assets with a contract, a gallery entry and a runner module: the label arrow, the "+" box, the "i", the remove x, the rails (BulletRail only) and the Back button (`npm run library`). The findings the runner reports (known findings in the contracts, and the rulebook's values table) are for the owner. Step 4 is built in part (2026-10-15): the baselined style lint (`npm run lint:styles`); the asset-name rule and the conversion of the style-reading tests are left to define. Next: asset by asset (step 5), with those tests converted as each asset gets its contract, and the page check last (step 6).

### Sources

- Design Tokens Community Group, [Design Tokens Format Module 2025.10](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/), [Resolver Module 2025.10](https://www.w3.org/community/reports/design-tokens/CG-FINAL-resolver-20251028/) and [designtokens.org](https://designtokens.org/): first stable version, 28 October 2025; not a W3C standard.
- Style Dictionary (secondary sources only; the official version 5 notes were not read): DTCG input, CSS custom property output, themes through custom formats ([Always Twisted](https://www.alwaystwisted.com/articles/a-design-tokens-workflow-part-10)).
- W3C, [CSS Color Module Level 5](https://www.w3.org/TR/css-color-5/): `color-mix()`, relative colour syntax, `light-dark()`; [web.dev, Color themes with Baseline CSS features](https://web.dev/articles/baseline-in-action-color-theme). The Baseline status (newly available in 2024) is from memory and was not confirmed.
- Playwright, [visual comparisons](https://playwright.dev/docs/test-snapshots); Storybook, [automate accessibility tests](https://storybook.js.org/blog/automate-accessibility-tests-with-storybook); axe-core finds on average about 57% of WCAG issues automatically (its own README, quoted by a secondary source).
- W3C, WCAG 2.2: success criteria 1.4.3 (contrast, text), 1.4.11 (non-text contrast), 2.5.8 (target size, minimum 24px).

## 5.14 Library automation, step 2: sizes left for the owner (2026-10-14)

Step 2 replaces only values that are identical to a token, so no page changes (corner steps 4, 6 and 8px; gap scale 2, 4, 6, 8, 12, 16 and 24px; `scripts/tokens/codemod-sizes.mjs`, a dry run unless `--write`). Everything else is left as written. **These are the values waiting for a decision**: for each, either it joins a step (and then moves by the difference, which is a visible change to check), or a step or scale value is added for it, or it stays a literal.

### Corners and gaps

| Property | Value | Why it is left | Uses | Main files |
|---|---|---|---|---|
| gap | `10px` | off the scale | 19 | conversation.css 11, organization-calendar.css 4, review.css 2 |
| gap | `20px` | off the scale | 16 | conversation.css 6, global-settings.css 3, business-documents.css 2 |
| gap | `14px` | off the scale | 10 | conversation.css 3, organization-calendar.css 2, capability-description.css 1 |
| gap | `18px` | off the scale | 3 | conversation.css 2, bullet-rail.css 1 |
| gap | `28px` | off the scale | 3 | review.css 2, conversation.css 1 |
| gap | `32px` | off the scale | 2 | section-tiles.css 2 |
| gap | `36px` | off the scale | 1 | business-documents.css 1 |
| gap | `64px` | off the scale | 1 | conversation.css 1 |
| gap | `3px` | off the scale | 1 | conversation.css 1 |
| gap | `56px` | off the scale | 1 | workspace.css 1 |
| gap | `40px` | off the scale | 1 | workspace.css 1 |
| corner | `10px` | off the scale | 9 | conversation.css 4, app-header.css 1, business-documents.css 1 |
| corner | `12px` | off the scale | 9 | organization-calendar.css 4, landing.css 2, capability-description.css 1 |
| corner | `1px` | off the scale | 7 | conversation.css 3, section-tiles.css 2, landing.css 1 |
| corner | `2px` | off the scale | 6 | conversation.css 2, section-tiles.css 2, numbered-list.css 1 |
| corner | `3px` | off the scale | 4 | conversation.css 2, global.css 1, section-tiles.css 1 |
| corner | `7px` | off the scale | 2 | conversation.css 2 |
| corner | `24px` | off the scale | 1 | landing.css 1 |
| gap | `var(--space-card, 12px)` | mixed with a token; the px part is left | 1 | card-tile.css 1 |
| gap | `12px var(--space-cell)` | mixed with a token; the px part is left | 1 | conversation.css 1 |
| gap | `var(--space-field) 12px` | mixed with a token; the px part is left | 1 | conversation.css 1 |
| gap | `var(--space-field) 14px` | mixed with a token; the px part is left | 1 | conversation.css 1 |
| gap | `var(--space-card) 24px` | mixed with a token; the px part is left | 1 | conversation.css 1 |
| gap | `var(--space-field) 16px` | mixed with a token; the px part is left | 1 | demand.css 1 |
| gap | `var(--space-field) 24px` | mixed with a token; the px part is left | 1 | section-tiles.css 1 |

Not on the list because they need no decision: zero, `50%`, `999px` and `normal` (shapes and keywords), `em` and `vw` gaps (not px), and values that are entirely a token or a calculation.

### Breakpoints

The stylesheets use 13 window boundaries (one is a height) and 20 container boundaries (catalogue in `tokens.ts`: `viewportBreakpoints`, `containerBreakpoints`). CSS cannot read a variable inside `@media` or `@container`, so they stay as written. Three places are drawn twice within 2px; merging them moves a rule by 1 to 2px of width:

| Kind | Wide from | Spellings (uses) |
|---|---|---|
| window | 1100 / 1101 | max-width: 1099px (2), min-width: 1100px (1) ; max-width: 1100px (2) |
| container | 358 / 360 | max-width: 357.98px (1) ; max-width: 359.98px (1) |
| container | 600 / 601 | max-width: 599.98px (2), max-width: 599px (2) ; max-width: 600px (1) |

The decided set (768, 1200, heights 900 and 1250) is not yet used by any query; moving the queries to it changes the layout between the old and new widths, so it is a separate decision.
