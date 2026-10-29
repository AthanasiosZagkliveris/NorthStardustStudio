# AI Knowledge Base: docs/ai/

Status: **index**, updated 2026-10-29.

This folder is NorthStardustStudio's shared knowledge for AI assistants (Claude, ChatGPT, or any other coding assistant working on this project). It exists so an assistant does not have to re-derive facts about the code every session. This file is the map. It does not explain any concept itself; every concept below is owned by exactly one other file.

Elsewhere in `docs/`:
- `../README.md`: the contents of every document of the project (design, specifications, archive), with its kind and date; `../index.md`: the alphabetical index of the subjects. Both are written by `npm run docs:index`.
- `../app/contents.md`: the contents of the app (how it is entered, the Systems and pages, the places in the code); `../app/index.md`: an alphabetical list of its places; `../app/glossary.md`: one line per term (framework, app, questionnaire, documents), with a pointer to the document that explains it. Start there to find your way into the product.
- `../design/core/04-log.md`: the history of every change, newest on top, and the only place a change is written; `../design/core/05-not-done-yet.md`: what is still open.
- `../archive/`: proposals that were written and not built, and finished plans; nothing there is a rule.

Documents cite one another by number ("doc 21" is `../design/current/21-shared-components.md`); the number is in the file name, whatever the folder.

## Read first, by task

| If you are going to... | Read first | Then |
|---|---|---|
| Do any work at all (every session) | `ai-collaboration-rules.md`, `toolchain-and-verification-playbook.md` | |
| Change or add something on screen (a table, tile, card, page, control) | `review-checklist.md`, then grep `layout-rules.md` for the name of the thing | `tile-and-card-pattern.md`, `card-kinds.md`; from `../design/current/`: `21-shared-components.md` (use the shared components), `18-reactions.md`, `24-tooltips.md`, `23-popups.md` |
| Judge or review a screen | `review-criteria.md` (the standard and how to measure it), `review-checklist.md` (the list to tick) | `layout-rules.md` |
| Change the Customer Engagement page | `customer-engagement-layout.md` | `layout-rules.md` |
| Write or edit a System's content (the Markdown under `src/assets`) | `framework-dsl-grammar.md` | `framework-conventions-and-patterns.md` |
| Change the framework's code (parser, model, engine, export, notes) | `framework-conventions-and-patterns.md` | `code-map.md` |
| Find where something is in `src` | `code-map.md` | `../app/contents.md` |
| Run a diagnostic or a scan | `outstanding-findings.md` (check it first, add to it) | |

## The files

**Standing rules and procedure**
- `ai-collaboration-rules.md`: the standing rules (commit, never push without the owner's yes; no unrequested changes; ask or decide; what "done" requires) and how work flows.
- `toolchain-and-verification-playbook.md`: the exact procedure (typecheck, tests, the checks, build, layout check, look) and the list of expected test failures.
- `outstanding-findings.md`: confirmed problems a diagnostic found and did not fix.

**Changing the screens (rules; a check enforces most of them)**
- `layout-rules.md`: the measured rulebook of the Foundation pages (tokens, the closed set of sizes, alignment, the reactions per kind, the Inventory) and the automatic layout check that must pass.
- `tile-and-card-pattern.md`: the short, visual brief of how tiles, frames, cards, rails (the page tab) and dialogs are built, and the rules that are global.
- `customer-engagement-layout.md`: the layout of the Customer Engagement tables, the Channel resources table and the action markers.
- `card-kinds.md`: the kinds of card, where each one's code is and how its head is built.
- `review-criteria.md`: the standard a screen is judged by (type, spacing, controls, colour, tiles, cards, tables, pop-up windows, pages, data), how each criterion is measured, and the form of the report.
- `review-checklist.md`: what to check when reviewing a table, tile, card, page or control, and the proof before saying done.

**Changing the content and the code**
- `framework-dsl-grammar.md`: the syntax of a System's content files.
- `framework-conventions-and-patterns.md`: the non-obvious architectural patterns (cross-Section sharing, auto-ordering, the tabbed layout, the three special-case editors, sources, field keys, the Notepad) and the data model.
- `code-map.md`: where things are in `src` (the folders and what is in each), and the rules for a new file.

## How these files relate

Nothing here should duplicate another file's knowledge. If two files seem to say the same thing, flag it rather than trusting whichever was read first. For the look of the Foundation pages, each fact has one home: colours, sizes and breakpoints in `src/styles/tokens/tokens.ts` (generated into the stylesheets), and an asset's geometry, states and variants in its contract under `src/library`. The rulebook, `tile-and-card-pattern.md`, the page specifications and `../design/core/01-current-design.md` describe them in words; where one of them disagrees with the code, the code is right and the document is the one to fix.

Skills (kept outside this folder) point at files here by path; this folder is the single source of truth they read, and a skill carries no copy of it. Do not move or rename a file here.

## Writing or changing a document

Follow `docs/standard.md`: where the document goes, its number, its head (title and status line), its kind, and how it is written. `npm run docs:standard` checks it, and `npm run docs:check` runs it.
