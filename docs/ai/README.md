# AI Knowledge Base: docs/ai/

This folder is NorthStardustStudio's shared knowledge for AI assistants (Claude, ChatGPT, or any other coding assistant working on this project). It exists so an assistant does not have to re-derive facts about the code every session. This file is the map. It does not explain any concept itself; every concept below is owned by exactly one other file.

The index of every document of the project (design, specifications, archive), with its kind and date, is `../README.md`. The history of what changed is `../design/core/04-log.md`; what is still open is `../design/core/05-not-done-yet.md`.

## Read this first, every session

1. **`ai-collaboration-rules.md`**: the standing rules (commit, never push without the owner's yes; no unrequested changes; ask or decide; what "done" requires) and how work flows. Short; re-read it every session.
2. **`toolchain-and-verification-playbook.md`**: the exact procedure (typecheck, tests, the checks, build, layout check, look) and the list of expected test failures.

## Changing the screens (the rules; a check enforces most of them)

- **`layout-rules.md`**: the measured rulebook of the Foundation pages (tokens, the closed set of sizes, alignment, interactions, the Inventory) and the automatic layout check that must pass. Grep it for the name of the thing before judging it.
- **`tile-and-card-pattern.md`**: how tiles, frames, cards, rails (the page tab) and dialogs are built, and the rules that are global. Read it with `layout-rules.md`.
- **`customer-engagement-layout.md`**: the layout of the Customer Engagement tables, the Channel resources table and the action markers.
- **`review-criteria.md`**: the standard a screen is judged by (type, spacing, controls, colour, tiles, cards, tables, pop-up windows, pages, data), how each criterion is measured, and the form of the report.
- **`review-checklist.md`**: what to check when reviewing a table, tile, card, page or control, and the proof before saying done. Read it before any change on screen.
- **`card-kinds.md`**: the kinds of card, where each one's code is and how its head is built.
- Also read, from `../design/`: `21-shared-components.md` (which components are shared; use them), `24-tooltips.md`, `23-popups.md`, `18-reactions.md`.

## Changing the content (the framework)

- **`framework-dsl-grammar.md`**: authoring or editing a System's content? Read this before touching any Markdown file under `src/assets`.
- **`framework-conventions-and-patterns.md`**: the non-obvious architectural patterns (cross-Section sharing, auto-ordering, the tabbed layout, the three special-case editors) and the data model.

## Finding your way

- **`../app/contents.md`**: the contents of the app (how it is entered, the pages, the code locations) and, beside it, `index.md` (an alphabetical list of its places). Start here to find your way into the product.
- **`code-map.md`**: where things are in `src` (the folders and what is in each), and the rules for a new file.
- **`../app/glossary.md`**: one line per term (framework, app, questionnaire, documents), with a pointer to the document that explains it.
- **`outstanding-findings.md`**: confirmed problems a diagnostic found and did not fix. Check it before running a diagnostic.

## How these files relate

Nothing here should duplicate another file's knowledge. If two files seem to say the same thing, flag it rather than trusting whichever was read first. For the look of the Foundation pages, each fact has one home: colours, sizes and breakpoints in `src/styles/tokens/tokens.ts` (generated into the stylesheets), and an asset's geometry, states and variants in its contract under `src/library`. The rulebook, `tile-and-card-pattern.md`, the page specifications and `docs/design/core/01-current-design.md` describe them in words; where one of them disagrees with the code, the code is right and the document is the one to fix.

Skills (kept outside this folder) point at files here by path; this folder is the single source of truth they read, and a skill carries no copy of it.

Proposals that were written and not built, and finished plans, are in `../archive/`; nothing there is a rule.
